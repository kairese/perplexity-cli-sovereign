# Sovereign Mesh — CLI Context

This fork is adapted to run against a self-hosted sovereign mesh on a private local network.

- Intelligence API: the mesh exposes a sovereign intelligence API on the local network; its endpoint is configured out-of-band and is not recorded here.
- Context services: a Qdrant vector store and a local Ollama model host provide mesh context enrichment before CLI dispatch.
- Automation: workflow automation runs on a self-hosted n8n instance on the mesh.
- Host access: the mesh host is administered over SSH; containers are inspected through the host's local container runtime.

Next: activate the remaining automation workflows; complete the MCP gateway tunnel migration.
