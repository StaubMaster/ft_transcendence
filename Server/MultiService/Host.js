import { PortO } from './PortO.js';



const portO = new PortO('localhost', 1000);
portO.request('POST', '/test1', 'some stuff');
portO.request('POST', '/test2', 'some stuff');


