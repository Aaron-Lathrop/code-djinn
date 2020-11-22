const buildContexts = [
    {
        route: 'comments',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/comments`',
        rewritable: false
    },
    {
        route: 'users',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/users`',
        rewritable: false
    },
    {
        route: 'posts',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/posts`',
        rewritable: false
    },
    {
        route: 'todos',
        inputs: '',
        dataSource: '`https://jsonplaceholder.typicode.com/todos`',
        rewritable: false
    },
    {
        route: 'individual',
        inputs: 'search',
        dataSource: '`https://pokeapi.co/api/v2/pokemon/${search}`',
        rewritable: false
    }
];
exports.buildContexts = buildContexts;
