import * as fs from 'fs-extra'
import * as path from 'path'

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
        
        const [breaking, feature, patch] = (version as string).split('.').map(s => parseInt(s))
        const nextVersion = `${breaking}.${feature + 1}.${patch}`

        /**
         * This auto increment and publish is making assumptions that the package we read was the latest package and version published which isn't very robust
         * This assumes this only runs a master branch and is always the latest commit.  If someones a build for a previous commit this would increment and attempt
         * to publish for a version which already exists and fail.
         * 
         * Alternatives are to query npm; however, semantic-release found the inconsistencies to be challenging and moved to querying git tags.  However, git tags could also
         * be out of date.
         */
        // TODO: Make more robust
        console.log(`Auto-incrementing minor (feature) version...`)
        console.log(`Next version: `, nextVersion)

        const newPackageJson = {
            name,
            version: nextVersion,
            description,
            keywords,
            author,
            repository,
            license,
            main: "index.js",
            typings: "index.d.ts"
        }

        const updatedRootPackageJson = {
            ...packageJsonObj,
            version: nextVersion
        }

        console.log(`Writing root package.json with updated version`)
        await fs.writeJson(packageJsonPath, updatedRootPackageJson, { spaces: '  ' })

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
}

main()
