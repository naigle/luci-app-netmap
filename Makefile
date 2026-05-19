include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-netmap
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_MAINTAINER:=Your Name <you@example.com>
PKG_LICENSE:=GPL-2.0

PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-netmap
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=Network Map Dashboard
  DEPENDS:=+luci-base +iw +nmap +ip-full
  PKGARCH:=all
endef

define Package/luci-app-netmap/description
  Visual network topology dashboard for OpenWrt. Discovers and maps
  all wired and wireless devices, identifies device types using MAC OUI
  lookup, nmap OS fingerprinting and hostname patterns, and renders an
  interactive SVG topology diagram grouped by interface/radio.
endef

define Build/Prepare
	mkdir -p $(PKG_BUILD_DIR)
endef

define Build/Compile
endef

define Package/luci-app-netmap/install
	# LuCI controller
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/controller
	$(INSTALL_DATA) ./luasrc/controller/netmap.lua \
		$(1)/usr/lib/lua/luci/controller/

	# LuCI view
	$(INSTALL_DIR) $(1)/usr/lib/lua/luci/view/netmap
	$(INSTALL_DATA) ./luasrc/view/netmap/dashboard.htm \
		$(1)/usr/lib/lua/luci/view/netmap/

	# Static web assets
	$(INSTALL_DIR) $(1)/www/luci-static/resources/netmap
	$(INSTALL_DATA) ./htdocs/luci-static/resources/netmap/app.js \
		$(1)/www/luci-static/resources/netmap/
	$(INSTALL_DATA) ./htdocs/luci-static/resources/netmap/style.css \
		$(1)/www/luci-static/resources/netmap/

	# Scanner + OUI database
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/netmap.scan $(1)/usr/bin/netmap-scan

	$(INSTALL_DIR) $(1)/usr/share/netmap
	$(INSTALL_DATA) ./files/oui.db $(1)/usr/share/netmap/oui.db

	# Init / service script
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/netmap.init $(1)/etc/init.d/netmap

	# Data directory
	$(INSTALL_DIR) $(1)/etc/netmap
endef

$(eval $(call BuildPackage,luci-app-netmap))
