exports.up = function (knex) {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').unique().notNullable();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.string('first_name');
    table.string('last_name');
    table.integer('balance').notNullable();
    table.string('location');
    table.string('avatar');
    table.string('deck');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('users');
};
