const repl = require("repl");
const fs = require("fs");
const vm = require("vm");
const md5 = require("md5")

const r = repl.start("λ ");

r.defineCommand('watch', {
    help: 'Automatically reload file in repo on file change',
    action(file) {
       const importFile = importIntoReplContext(r)

       console.log(`importing: ${file}`)
       importFile(file) 

       this.clearBufferedCommand()
       console.log(`Watching for changes to: ${file}`)

       this.displayPrompt()

       watchFileForChange(file, () =>
            {
                console.log('reimporting module..')
                importFile(file)
                console.log('reimported module')
                this.displayPrompt()
            })

    }
})

function importIntoReplContext(repl) {
    return function(file) {
        try {
            delete require.cache[require.resolve(file)];
            const newImport = require(file)
            repl.context = vm.createContext(newImport)
        } catch(e) {
            throw new Error(`Unable to load ${file} into context`)
        }
    }
}

function watchFileForChange(file, onChange) {
    if (!file) throw new Error('file missing')

    let md5Previous = null
    let fsWait = false

    fs.watch(file, (event, fileName) => {
        try {
            if (fileName) {
                if (fsWait) return

                fsWait = setTimeout(() => {
                    fsWait = false
                }, 100)

                console.log(`${file}: getting latest`)
                const md5Current = md5(fs.readFileSync(file))

                if (md5Current === md5Previous) {
                    return
                }

                md5Previous = md5Current
                onChange()
            }
        } catch(e) {
            throw new Error(`Error occured when watching file: ${file}`)
        }
    })
}

