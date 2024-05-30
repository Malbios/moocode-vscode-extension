import { MooClient } from 'moo-client-ts';

import MoocodeServer from './server';

// TODO: get credential from config
const mooClient = MooClient.create('127.0.0.1', 7777, 'ServiceAccount', 'osywU');

const server = MoocodeServer.create(mooClient);

server.listen();