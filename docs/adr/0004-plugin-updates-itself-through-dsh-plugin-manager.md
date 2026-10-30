# The plugin updates itself through DSH's plugin manager

The page checks the registries DSH is configured with for a newer release and installs it with DSH's own plugin manager, from the registry's tarball address, instead of asking users to run a command or shipping an installer of its own. DSH's manager validates the package, restores the profile's manifest and lockfile when an install fails or is cancelled, and decides whether a restart is needed. A development install (`link:`) is never checked. dsh-modes, dsh-mode-skills, and dsh-request-params keep this mechanism the same.
