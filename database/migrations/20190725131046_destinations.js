exports.up = knex =>
  knex.schema.createTable("destinations", table => {
    table
      .string("id")
      .notNullable()
      .unique();
    table.string("location").notNullable();
    table.integer("maxprice").notNullable();
    table.integer("minprice").notNullable();
    table.boolean("opennow").notNullable();
    table.string("query").notNullable();
    table.string("type").notNullable();
  });

exports.down = knex => knex.schema.dropTableIfExists("destinations");
