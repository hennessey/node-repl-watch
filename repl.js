const repl = require("repl");
const fs = require("fs");
const vm = require("vm");

const r = repl.start("λ ");

r.defineCommand('watch', {
    help: 'Automatically reload file in repo on file change',
    action(file) {
       this.clearBufferedCommand() 
       watch(file, onChange)
       this.displayPrompt()
    }
})

function onChange(file) {
    delete require.cache[require.resolve(file)]; 
    console.log('reimporting')
    const newImport = require(file)
    r.context = vm.createContext(newImport)
}

function watch(file, onChange) {
    if (!file) throw new Error('file missing')
    console.log(`Watching for changes to: ${file}`)

    let md5Previous = null
    let fsWait = false

    fs.watch(file, (event, fileName) => {
        if (fileName) {
            if (fsWait) return

            fsWait = setTimeout(() => {
                fsWait = false
            }, 100)

            console.log(`${file}: getting latest`)
            const md5Current = fs.readFileSync(file)
            
            if (md5Current === md5Previous) {
                return
            }

            md5Previous = md5Current
            console.log(`${file} changed`)
            onChange(file)
        }
    })
}

