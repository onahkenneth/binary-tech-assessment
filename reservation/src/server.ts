import { serve, type BunRequest } from 'bun';
import routes from './routes';

const server = serve({
  port: process.env.PORT || 3000,
  routes: routes,
  async fetch(req: BunRequest) {
    const url = new URL(req.url);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = Bun.file(`./public${pathname}`);
    
    if (await file.exists()) {
      return new Response(file);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on ${server.url}`);