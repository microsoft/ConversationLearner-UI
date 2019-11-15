import * as express from 'express'
import * as path from 'path'

const buildPath = path.join(__dirname, '..', 'build')
const indexPath = path.join(buildPath, 'index.html')

const router = express.Router({ caseSensitive: false })
router.use('/ui', express.static(buildPath));
router.get('/ui/*', function(_, res) {
    res.sendFile(indexPath)
})

const app = express()
app.use(router)
const listener = app.listen(9000, () => {
    const address = listener.address()
    const port = typeof address === 'string'
        ? address
        : address?.port

    console.log(`Testing ${buildPath} on: http://localhost:${port}/ui`)
});