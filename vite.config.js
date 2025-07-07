import glsl from 'vite-plugin-glsl';

export default {
    root: ".",
    base: "./",
    plugins: [
        glsl()
    ],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'docs',
        emptyOutDir: true
    }
};
