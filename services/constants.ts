
import { Product, Category } from '../types';

export const CATEGORIES: Category[] = [
  { id: 'proxies', name: 'Elite Proxies', icon: 'fa-network-wired' },
  { id: 'vpns', name: 'Secure VPNs', icon: 'fa-user-shield' },
  { id: 'rdps', name: 'Cloud RDP', icon: 'fa-server' },
  { id: 'accounts', name: 'SaaS Suite', icon: 'fa-key' },
  { id: 'logs', name: 'Digital Logs', icon: 'fa-database' },
  { id: 'seo', name: 'SEO Assets', icon: 'fa-chart-line' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Private Residential Proxy (10GB)',
    description: 'Ultra-fast residential proxies with clean IP addresses. Optimized for high-frequency scraping and sensitive account automation.',
    price: 45000,
    category: 'proxies',
    stock: 88,
    rating: 4.9,
    image: 'https://picsum.photos/seed/proxy-pro/400/400',
    features: ['10GB Premium Data', 'Global IP Pool', 'Instant Delivery', 'HTTP/SOCKS5 Support'],
    isVisible: true,
    secretContent: 'AUTH_KEY: proxy-net-9921-x82, HOST: r.proxies.nettoolz.com, PORT: 9000'
  },
  {
    id: '2',
    name: 'GhostVPN Enterprise - 1 Year',
    description: 'Military-grade encryption with a strict zero-logs policy. Access restricted global content with zero latency.',
    price: 35000,
    category: 'vpns',
    stock: 240,
    rating: 5.0,
    image: 'https://picsum.photos/seed/vpn-pro/400/400',
    features: ['Multi-Hop Encryption', 'Unlimited Bandwidth', 'Dedicated IP Option', 'Kill Switch v2.0'],
    isVisible: true,
    secretContent: 'ACCOUNT_ID: user_ghost_991, LICENSE: GH-921-BBS-772'
  },
  {
    id: '3',
    name: 'Windows RDP Pro (Azure USA)',
    description: 'Dedicated Windows Server 2022 instance with 16GB RAM and NVMe storage. Hosted in premium US datacenters for lowest latency.',
    price: 25000,
    category: 'rdps',
    stock: 12,
    rating: 4.8,
    image: 'https://picsum.photos/seed/rdp-pro/400/400',
    features: ['16GB DDR4 RAM', '500GB NVMe SSD', '1Gbps Network Port', 'Full Admin Privileges'],
    isVisible: true,
    secretContent: 'IP: 52.122.33.10, USER: NetAdmin, PASS: Vault#Toolz@2024'
  },
  {
    id: '4',
    name: 'Bulk SEO Traffic Logs (Global)',
    description: 'Comprehensive data logs for market research and competitive SEO analysis. Includes historical traffic patterns and keyword origins.',
    price: 18000,
    category: 'logs',
    stock: 55,
    rating: 4.7,
    image: 'https://picsum.photos/seed/logs-pro/400/400',
    features: ['CSV & JSON Format', '1 Million+ Entries', 'Global Coverage', 'Metadata Included'],
    isVisible: true,
    secretContent: 'DOWNLOAD_LINK: https://s3.nettoolz.com/logs/bulk_9921.zip, PIN: 8812'
  }
];
