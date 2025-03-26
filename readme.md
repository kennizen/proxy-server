
// reverse proxy
1. First step is client will request the proxy server at an endpoint http://localhost:8080
2. Get the available server to be forwarded the request to with the details about 
the endpoint and forward it.
3. After getting an request now i have to forward it back to the client that requested it

// load balancer
1. Look for best algos to route the traffic between the servers.
2. Create a class to inject the algo as a dependency
3. Create an interface for the algo class as an abstraction
4. Make a health check function to work with the load balancer

// server pool
1. Introduced a server pool that takes care of the server health statuses
2. Design the pool in such a way so that the at any given point when the heathy servers are requested
it is there in the pool to be served
3. If all the servers become unhealthy then send a 500 response to the client saying th server is in no-op

// cache and more
1. Add more loadbalancing algos
2. Add a caching mechanism
3. Add retry logic for unhealthy servers