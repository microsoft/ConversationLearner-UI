import * as fs from 'fs-extra'
import * as path from 'path'

// const packageJsonPath = path.join(__dirname, '..', 'publish', 'package.json')
const buildPath = path.join(__dirname, '..', 'build')
const npmRcPath = path.join(__dirname, '..', '.npmrc')
const packageJsonPath = path.join(__dirname, '..', 'publish', 'package.json')
const uiPackagePath = path.join(__dirname, '..', 'package')

async function main() {
    console.log(`Copy: ${buildPath} to ${uiPackagePath}`)
    try {
        await fs.copy(buildPath, uiPackagePath)
    }
    catch (e) {
        console.error(e)
    }

    console.log(`Copy: ${packageJsonPath} to ${uiPackagePath}`)
    try {
        await fs.copy(packageJsonPath, uiPackagePath)
    }
    catch (e) {
        console.error(e)
    }

    console.log(`Copy: ${npmRcPath} to ${uiPackagePath}`)
    try {
        await fs.copy(npmRcPath, uiPackagePath)
    }
    catch (e) {
        console.error(e)
    }
}

main()
