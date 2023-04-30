# rateLimiter
Rate limiting proxy that uses database replication and a quorum algorithm to maintain scalability.

This application serves as a proxy to limit requests to a destination server from a specific username. It can also be easily modified to limit requests 
based on IP addresses, request parameters, regions, and more. The requests are stored using a configurable cluster of replicated databases behind a load balancer. The load
balancer employs consistent hashing techniques to determine which databases will be queried based on the requester's username. Requests are validated based on a quorum algorithm 
in which the majority of the queried databases must confirm a read or write to validated the request. The quorum threshold is defined in the config file, and determines the
number of servers which must respond to the request for it to be processed. This ensures reliability, availability, and scalability while also allowing the end user to define
the degree of fault tolerance and speed required for limiting requests to the end destination.
