import {defineConfig , loadEnv} from 'vite'
import {execSync} from "child_process"

var _opt

export default defineConfig((opt) => 
{
    console.log(opt)
    _opt = opt

    const env = loadEnv(opt.mode, process.cwd(), '');

    const aliasConfig = {
        resolve: {
            alias: {
                'parser': env.PARSER_LIB 
            }
        }
    };

    if(opt.command == "serve" )
    return { ...configExample, ...aliasConfig };

    if(opt.command == "build")
    return { ...configBuild, ...aliasConfig };

    throw new Error("Mode not defined: use [build | dev]")

})

const configExample = 
{
    root:"./",
    server:
    {
        open: "./examples/index.html",
        host:"localhost.local",
        allowedHosts:["localhost.local"],
        port:5555,
    },

}

const configBuild = 
{
    build:
    {
        outDir:"./build",
        assetsDir:"",
        emptyOutDir:false,
        minify:"esbuild",
        sourcemap: true,
        rollupOptions: 
        {
            input: 
            {
              main: './src/index.js', 
            },
            output:
            {
                entryFileNames:`nextpage-client.min.js`
            }
        }
    }
}
