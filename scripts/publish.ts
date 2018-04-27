import * as fs from 'fs-extra'
import * as path from 'path'
import * as execa from 'execa'

const packageJsonPath = path.join(__dirname, '..', 'package.json')
const buildPath = path.join(__dirname, '..', 'build')
const npmRcPath = path.join(__dirname, '..', '.npmrc')
const uiPackagePath = path.join(__dirname, '..', 'package')
const indexJsPath = path.join(uiPackagePath, 'index.js')
const indexDtsPath = path.join(uiPackagePath, 'index.d.ts')

interface IVersion {
    breaking: number
    feature: number
    patch: number
    original: string
}

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

    console.log(`Copy: ${npmRcPath} to ${uiPackagePath}`)
    try {
        await fs.copy(npmRcPath, path.join(uiPackagePath, '.npmrc'))
    }
    catch (e) {
        throw e
    }

    console.log(`Get last release:`)
    const gitTagsOutput = await execa.stdout('git', ['tag', '-l', '--sort=v:refname'])
    const tagVersions = gitTagsOutput.split('\n')
        .filter(t => /v(\d+).(\d+).(\d+)/.test(t))
        .reduce((versions: IVersion[], t) => {
            const match = t.match(/v(\d+).(\d+).(\d+)/)
            if (match === null) {
                return versions
            }

            const [breaking, feature, patch] = match.slice(1,4).map(x => parseInt(x))
            return [...versions, {
                breaking,
                feature,
                patch,
                original: t
            }]
        }, [])

    // TODO: Actually sort by max breaking, feature, patch since it's not clear that git will sort correctly be default
    const highestTag = tagVersions[tagVersions.length - 1]
    const { breaking, feature, patch } = highestTag
    const nextVersion = `${breaking}.${feature + 1}.${patch}`
    console.log(`Last Release: `, highestTag.original)
    console.log(`Next Version: `, nextVersion)

    console.log(`Reading package.json from: ${packageJsonPath}`)
    try {
        const packageJsonObj = await fs.readJson(packageJsonPath)
        const { name, version, description, keywords, author, repository, license } = packageJsonObj
        console.log(`Found name: ${name} version: ${version}`)

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

        const newPackageJsonFilePath = path.join(uiPackagePath, 'package.json')
        console.log(`Writing new package.json to ${newPackageJsonFilePath}`)
        await fs.writeJson(newPackageJsonFilePath, newPackageJson, { spaces: '  ' })
    }
    catch (e) {
        throw e
    }

    console.log(`Create tag on current commit using the next version: ${nextVersion}`)
    await execa('git', ['tag', '-a', '-m', `${nextVersion}`, `v${nextVersion}`])
}

main()
