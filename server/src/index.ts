import app from './app';
import logger from './logger';
import config from './config';

const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  logger.info({ label: 'MAIN', message: `Listening on ${PORT}` });
});
