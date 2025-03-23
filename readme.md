
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