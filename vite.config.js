import glsl from 'vite-plugin-glsl';

export default {
    root: ".",
    plugins: [
        glsl()
    ],
    server: {
        port: 3000,
        open: true
    }
};
