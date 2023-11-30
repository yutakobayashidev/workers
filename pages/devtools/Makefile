# https://github.com/cloudflare/workers-sdk/blob/main/packages/wrangler-devtools/Makefile

ROOT = $(realpath .)
PATH_WITH_DEPOT = $(PATH):$(ROOT)/depot/
# The upstream devtools commit upon which our patches are based
HEAD = 64208f10b3efe06a92c58d345bd828832d09c4a7

depot:
	git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git depot

devtools-frontend: depot
	git clone https://chromium.googlesource.com/devtools/devtools-frontend
  # Ensure other depot_tools can be called from gclient config
	PATH="$(PATH_WITH_DEPOT)" $(ROOT)/depot/gclient config https://chromium.googlesource.com/devtools/devtools-frontend --unmanaged
	git -C devtools-frontend checkout $(HEAD)

devtools-frontend/out/Default/gen/front_end: devtools-frontend
	cd devtools-frontend && PATH="$(PATH_WITH_DEPOT)" $(ROOT)/depot/gclient sync
	cd devtools-frontend && PATH="$(PATH_WITH_DEPOT)" $(ROOT)/depot/gn gen out/Default
	cd devtools-frontend && PATH="$(PATH_WITH_DEPOT)" $(ROOT)/depot/autoninja -C out/Default

publish: devtools-frontend/out/Default/gen/front_end
	pnpx wrangler pages deploy --project-name devtools devtools-frontend/out/Default/gen/front_end

cleanup:
	rm -rf devtools-frontend .gclient* .cipd node_modules depot