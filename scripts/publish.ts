import * as fs from 'fs-extra'
import * as path from 'path'
import * as execa from 'execa'

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const buildPath = path.join(__dirname, '..', 'build')
const npmRcPath = path.join(__dirname, '..', '.npmrc')
const uiPackagePath = path.join(__dirname, '..', 'package')
const indexJsPath = path.join(uiPackagePath, 'index.js')
const indexDtsPath = path.join(uiPackagePath, 'index.d.ts')

async function main() {
    console.log(`Verifying ${indexJsPath} exists`)
    try {
        await fs.ensureFile(indexJsPath)
    }
    catch (ex) {
        throw new Error(`${indexJsPath} did not exist.`)
    }

    console.log(`Verifying ${indexDtsPath} exists`)
    try {
        await fs.ensureFile(indexDtsPath)
    }
    catch (ex) {
        throw new Error(`${indexDtsPath} did not exist.`)
    }

    console.log(`Copy: ${buildPath} to ${uiPackagePath}`)
    try {
        await fs.copy(buildPath, uiPackagePath)
    }
    catch (e) {
        throw e
    }

    console.log(`Reading package.json from: ${packageJsonPath}`)
    try {
        const packageJsonObj = await fs.readJson(packageJsonPath)
        const { name, version, description, keywords, author, repository, license } = packageJsonObj
        console.log(`Found name: ${name} version: ${version}`)

        const newPackageJson = {
            name,
            version,
            description,
            keywords,
            author,
            repository,
            license,
            main: "index.js",
            typings: "index.d.ts"
        }

        const newPackageJsonFilePath = path.join(uiPackagePath, 'package.json')
        console.log(`Writing new package.json to ${newPackageJsonFilePath}`)
        await fs.writeJson(newPackageJsonFilePath, newPackageJson, { spaces: '  ' })
    }
    catch (e) {
        throw e
    }

    console.log(`Copy: ${npmRcPath} to ${uiPackagePath}`)
    try {
        await fs.copy(npmRcPath, path.join(uiPackagePath, '.npmrc'))
    }
    catch (e) {
        throw e
    }

    console.log(`BUILD_SOURCEVERSION: ${process.env.BUILD_SOURCEVERSION}`)
    const gitLogOutput = await execa.stdout('git', ['log', '-1', '--pretty=oneline'])
    const segements = gitLogOutput.split(' ')
    const commitMessage = segements[segements.length - 1]

    console.log(`git log output: `, gitLogOutput)
    console.log(`commit message: `, commitMessage)

    const messageMatchesTagFormat = /(\d+).(\d+).(\d+)/.test(commitMessage)
    console.log(`Message matches tag format: `, messageMatchesTagFormat)
    const shouldDeploy = !messageMatchesTagFormat
    console.log(`shouldDeploy: ${shouldDeploy}`)
    console.log(`##vso[task.setvariable variable=blisuideploy]${shouldDeploy}`)
}

main()
