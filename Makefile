include $(TOPDIR)/rules.mk

LUCI_TITLE:=Network Map Dashboard
LUCI_DEPENDS:=+luci-base +iw +nmap +ip-full
LUCI_DESCRIPTION:=Visual network topology dashboard for OpenWrt. Discovers and maps \
	all wired and wireless devices, identifies device types using MAC OUI \
	lookup, nmap OS fingerprinting and hostname patterns, and renders an \
	interactive SVG topology diagram grouped by interface/radio.

PKG_VERSION:=1.0.0
PKG_RELEASE:=2
PKG_MAINTAINER:=naigle <naigle@niversa.co.uk>
PKG_LICENSE:=GPL-2.0

include $(TOPDIR)/feeds/luci/luci.mk

# Additional files installation (non-standard paths)
define Package/luci-app-netmap/install
	# LuCI standard paths (manual since we override default install)
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/netmap
	$(CP) ./htdocs/luci-static/resources/view/netmap/* $(1)/www/luci-static/resources/view/netmap/

	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/* $(1)/usr/share/luci/menu.d/

	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/* $(1)/usr/share/rpcd/acl.d/

	# NetMap specific files
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) ./files/netmap.scan $(1)/usr/bin/netmap-scan

	$(INSTALL_DIR) $(1)/usr/share/netmap
	$(INSTALL_DATA) ./files/netmap-assemble.uc $(1)/usr/share/netmap/assemble.uc
	$(INSTALL_DATA) ./files/oui.db $(1)/usr/share/netmap/oui.db

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/netmap.init $(1)/etc/init.d/netmap

	$(INSTALL_DIR) $(1)/etc/netmap

	$(INSTALL_DIR) $(1)/usr/share/rpcd/ucode
	$(INSTALL_DATA) ./root/usr/share/rpcd/ucode/luci.netmap $(1)/usr/share/rpcd/ucode/luci.netmap
endef

$(eval $(call BuildPackage,luci-app-netmap))
