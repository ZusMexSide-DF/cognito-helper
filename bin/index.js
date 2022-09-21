#!/usr/bin/env node
import inquirer from 'inquirer';
import * as child from 'child_process';
import * as dotenv from 'dotenv'
dotenv.config()
inquirer.prompt([
    {
        type: 'list',
        name: 'whatToDo',
        message: 'que quieres hacer?',
        choices: ['actualizar atributos sin excel', 'actualizar atributos con archivo json (sin soporte aun)'],
    },
    {
        type: 'list',
        name: 'attributes',
        message: 'que atributo modificaras?',
        choices: ['name', 'rol', 'name & rol'],
        when: (answers) => answers.whatToDo === 'actualizar atributos sin excel'
    },
    {
        type: 'number',
        name: 'quantity',
        message: 'cuantos usuarios vas a modificar? (number)',
        when: (answers) => !!answers.attributes
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: 'A continuacion se te pedira ingresarar los datos por cada usuario que indicaste',
        when: (answers) => !!answers.quantity
    },
])
    .then(async (answers) => {
        const { whatToDo, attributes, quantity, confirm } = answers;
        if (whatToDo, attributes, quantity, confirm) {
            const arr = [];
            const opts = [];
            if (attributes === 'rol') opts.push(loadUserMessage(), loadRolMessage())
            if (attributes === 'name & rol') opts.push(loadUserMessage(), loadNameMessage(), loadRolMessage())
            if (attributes === 'name') opts.push(loadUserMessage(), loadNameMessage())
            for (let index = 0; index < quantity; index++) {
                let answers = await inquirer.prompt(opts);
                arr.push(answers);
            }
            awsCognitoExec(arr)
        }

    });

const loadUserMessage = () => {
    return {
        type: 'number',
        name: 'user',
        message: 'Ingresa el usuario ej. 2100000000070 (number)'
    }
}

const loadNameMessage = () => {
    return {
        type: 'input',
        name: 'name',
        message: 'Ingresa el nombre de usuario:'
    }
}

const loadRolMessage = () => {
    return {
        type: 'number',
        name: 'nickname',
        message: 'Ingresa el rol (number)\n1 - DM\n2 - Estrellas\n3 - Clerk\n4 - OM\n5 - AM\nRol:'
    }
}

const execWithPromise = command =>
    new Promise((resolve, reject) => {
        child.exec(command, (err, stout, sterr) => {
            if (err) {
                reject(sterr)
            } else {
                resolve(stout)
            }
        })
    })

async function awsCognitoExec(arr) {
    try {
        for (const answer of arr) {
            const { nickname, name, user } = answer;
            const description = selectDescription(nickname);
            const args = `--username ${user} --user-attributes ${name ? `Name="name",Value="${name}"` : ''} ${nickname ? `Name="nickname",Value="${nickname}"` : ''} ${description ? `Name="custom:rol",Value="${description}"` : ''}`
            const command = `aws cognito-idp admin-update-user-attributes --user-pool-id ${process.env['POOL_ID']} ${args}`
            console.log(command)
            const data = await execWithPromise(command);
            console.log('exitoso')
        }
    } catch (error) {
        console.error(error);
    }
}
const selectDescription = (rol) => {
    const description = {
        1: 'DM – Development Manager',
        2: 'Estrellas',
        3: 'Clerk',
        4: 'OM – Office Manager',
        5: 'AM – Area Manager'
    }
    return description[rol]
}