include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-netmap
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_MAINTAINER:=naigle <naigle@niversa.co.uk>
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
	# Scan script and ucode assembler
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/netmap.scan $(1)/usr/bin/netmap-scan

	$(INSTALL_DIR) $(1)/usr/share/netmap
	$(INSTALL_DATA) ./files/netmap-assemble.uc $(1)/usr/share/netmap/assemble.uc
	$(INSTALL_DATA) ./files/oui.db $(1)/usr/share/netmap/oui.db

	# Init / service script
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/netmap.init $(1)/etc/init.d/netmap

	# rpcd ucode handler + ACL + menu
	$(INSTALL_DIR) $(1)/usr/share/rpcd/ucode
	$(INSTALL_DATA) ./luci/rpcd/luci.netmap $(1)/usr/share/rpcd/ucode/luci.netmap

	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./luci/acl.d/luci-app-netmap.json $(1)/usr/share/rpcd/acl.d/luci-app-netmap.json

	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./luci/menu.d/luci-app-netmap.json $(1)/usr/share/luci/menu.d/luci-app-netmap.json

	# LuCI JS view
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/netmap
	$(INSTALL_DATA) ./www/resources/view/netmap/netmap.js \
		$(1)/www/luci-static/resources/view/netmap/netmap.js

	# Data directory
	$(INSTALL_DIR) $(1)/etc/netmap
endef

$(eval $(call BuildPackage,luci-app-netmap))
