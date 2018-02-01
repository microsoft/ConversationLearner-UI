import * as fs from 'fs-extra'
import * as path from 'path'

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const buildPath = path.join(__dirname, '..', 'build')
const npmRcPath = path.join(__dirname, '..', '.npmrc')
const uiPackagePath = path.join(__dirname, '..', 'package')
// const indexJsPath = path.join(uiPackagePath, 'index.js')
// const indexDtsPath = path.join(uiPackagePath, 'index.d.ts')

async function main() {
    // console.log(`Verifying ${indexJsPath} exists`)
    // try {
    //     await fs.readFile(indexJsPath, 'utf-8')
    // }
    // catch {
    //     throw new Error(`${indexJsPath} did not exist.`)
    // }

    // console.log(`Verifying ${indexDtsPath} exists`)
    // try {
    //     await fs.readFile(indexDtsPath, 'utf-8')
    // }
    // catch {
    //     throw new Error(`${indexDtsPath} did not exist.`)
    // }

    console.log(`Copy: ${buildPath} to ${uiPackagePath}`)
    try {
        await fs.copy(buildPath, uiPackagePath)
    }
    catch (e) {
        console.error(e)
    }

    console.log(`Reading package.json from: ${packageJsonPath}`)
    try {
        const packageJsonString = await fs.readFile(packageJsonPath, 'utf-8')
        const packageJsonObj = JSON.parse(packageJsonString)
        const { name, version } = packageJsonObj
        console.log(`Found name: ${name} version: ${version}`)
        const newPackageJson = {
            name,
            version,
            main: "index.js",
            typings: "index.d.ts"
        }

        const newPackageJsonFilePath = path.join(uiPackagePath, 'package.json')
        console.log(`Writing new package.json to ${newPackageJsonFilePath}`)
        await fs.writeFile(newPackageJsonFilePath, JSON.stringify(newPackageJson), 'utf-8')
    }
    catch (e) {
        console.error(e)
    }

    console.log(`Copy: ${npmRcPath} to ${uiPackagePath}`)
    try {
        await fs.copy(npmRcPath, path.join(uiPackagePath, '.npmrc'))
    }
    catch (e) {
        console.error(e)
    }
}

main()
