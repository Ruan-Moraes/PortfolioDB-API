import { createConnection } from 'mysql2/promise';

export const handler = async (event) => {
  const buildHeaders = (allowOrigin) => ({
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  });

  const getAllowOrigin = (event, allowedOrigins) => {
    const origin = event.headers.Origin || event.headers.origin;

    return allowedOrigins.includes(origin) ? origin : '';
  };

  const allowedOrigins = [
    'https://ruan-moraes.github.io',
    'http://127.0.0.1:5500', // Para testes locais
  ];
  const allowOrigin = getAllowOrigin(event, allowedOrigins);

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: buildHeaders(allowOrigin),
      body: JSON.stringify({ message: 'Preflight request' }),
    };
  }

  try {
    const connection = await createConnection({
      host: process.env.HOST,
      database: process.env.DATABASE,
      port: process.env.PORT,
      user: process.env.USER,
      password: process.env.PASSWORD,
    });

    try {
      const date = await connection.execute(`SELECT * FROM Qualifications`);

      return {
        statusCode: 200,
        headers: buildHeaders(allowOrigin),
        body: JSON.stringify(date[0]),
      };
    } catch (err) {
      throw new Error(err);
    } finally {
      await connection.end();
    }
  } catch (err) {
    console.log(err);

    return {
      statusCode: 500,
      headers: buildHeaders(allowOrigin),
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
