const Hapi = require('@hapi/hapi');
const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite:blog.sqlite');
const { CREATED, NO_CONTENT } = require('http-status');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: 'localhost'
    });

    class Post extends Model {}
    Post.init({
        title: DataTypes.STRING,
        content: DataTypes.TEXT
    }, { sequelize, modelName: 'post'});

    const data = [
        {
            title: 'Novo post',
            content: 'Olá amigos, nosso primeiro post',
        },
        {
            title: 'Outro post',
            content: 'Olá amigos, estamos a todo vapor produzindo conteúdo por aqui',
        }
    ];

    server.route({
        method: 'GET',
        path: '/posts',
        handler: async (request, h) => {
            return await Post.findAll();
        }
    });

    server.route({
        method: 'GET',
        path: '/posts/{id}',
        handler: async (request, h) => {
            const { id } = request.params;

            return await Post.findByPk(id);
        }
    });

    server.route({
        method: 'POST',
        path: '/posts',
        handler: async (request, h) => {
            const { payload } = request;

            return h.response(post).code(CREATED);
        }
    });

    server.route({
        method: 'PUT',
        path: '/posts/{id}',
        handler: async (request, h) => {
            const { params: { id }, payload } = request;

            await Post.update(payload, { where: { id }});
            const post = await Post.findByPk(id);

            return post;
        }
    });

    server.route({
        method: 'DELETE',
        path: '/posts/{id}',
        handler: async (request, h) => {
            const { id } = request.params;

            await Post.destroy({ where: { id }});

            return h.response().code(NO_CONTENT);
        }
    });

    try {
        await sequelize.sync();
        Post.bulkCreate(data);
    } catch (error) {
        throw new Error(error)
    }
    await server.start();

    console.log('\n\nServer running on %s', server.info.uri);
}

process.on('unhandleRejection', (err) => {
    console.log(err);
    process.exit(1);
})

init();
