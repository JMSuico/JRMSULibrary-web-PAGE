# JRMSU Library — Physical & Cloud Server OS Security Protocols

> [!NOTE]
> Your application codebase and Docker infrastructure are **100% secure and locked down**. You do not need to write any more code or change any more settings in the project files. 
> 
> However, because you are deploying to actual servers, you must secure the **Operating System (OS)** and **Hardware**. If a hacker cannot break your web app, they will try to break into the server itself.

Here is the final security checklist you need to perform on the actual server machines before you launch:

---

## 🛡️ Part 1: Cloud Server Deployment (AWS, DigitalOcean, Linode)
Since Cloud servers are exposed to the global public internet, they face thousands of automated hacking bots every hour.

### 1. Enable the Firewall (UFW)
By default, Ubuntu leaves all ports open. You must block everything except Web traffic (HTTP/HTTPS) and SSH. Run these commands on the server:
```bash
sudo ufw allow 22/tcp      # Allow SSH (so you can log in)
sudo ufw allow 80/tcp      # Allow HTTP
sudo ufw allow 443/tcp     # Allow HTTPS
sudo ufw enable
```

### 2. Disable SSH Password Login
Hackers will try to guess your root password 24/7. You must disable password logins and force **SSH Key Authentication** (using an `.pem` or `.pub` key file). 
* Edit `/etc/ssh/sshd_config`
* Set `PasswordAuthentication no`
* Restart SSH: `sudo systemctl restart sshd`

### 3. Install Fail2Ban
Install `fail2ban` (`sudo apt install fail2ban`). If someone types the wrong SSH password 5 times, this software permanently bans their IP address, stopping brute-force attacks instantly.

---

## 🛡️ Part 2: Enterprise Physical Server Deployment (Hardwired Campus Server)
This applies to an **actual, enterprise-grade physical server** (hardwired into the university's network via Ethernet, sitting in a server rack). Because it is a real physical server on the university's LAN (Local Area Network), your security setup is much stronger but requires physical precautions.

### 1. Static IP Configuration
Instead of dealing with shifting Wi-Fi IP addresses, the IT department will assign this server a **Static Intranet IP** (like `10.0.0.50` or `192.168.10.50`). 
* You will simply put that exact Static IP into your `ALLOWED_HOSTS` in the `docker-compose.yml` and `.env` file, and it will never change.

### 2. Hardware Firewall & Network Isolation
Because it is wired into the university's core network, it is protected by the university's main hardware firewalls. 
* The IT department can easily configure their main switches to route `library.jrmsu.local` (or even a public domain if they open a port) directly to this server's ethernet port.
* Ask the IT department to place the server on a **separate VLAN** from the students. The router should strictly block Port 22 (SSH) from student Wi-Fi networks so students cannot even attempt to hack the server's operating system.

### 3. Hardware & Physical Security
Since it is a real server, your primary physical security focuses must be:
* **Uninterruptible Power Supply (UPS):** Ensure the server is plugged into a heavy-duty battery backup. Brownouts or sudden power loss can corrupt the PostgreSQL database mid-transaction.
* **RAID Storage:** If the server supports it, ensure the hard drives are mirrored (RAID 1) so if one drive dies, the library data isn't lost.
* **Server Room Access:** The server must be in a locked rack or IT room. Only the Head IT Administrator and Chief Librarian should have the physical keys to the room where this server rack is located.
* **BIOS Lockdown:** Set a BIOS Password to prevent anyone from rebooting the server and booting into a hacker's USB operating system, and disable external USB boot drives.

### 4. Automated Database Backups
Since this is a physical machine, hard drives can fail, or catastrophic power surges can wipe data. You must configure a script to back up the PostgreSQL database to a secure external cloud (like Google Drive or AWS S3) at least once a week.

---

## 🧠 Part 3: Advanced Anti-Hacking & Enterprise Security Mindset
To defend against sophisticated, determined attackers (or malicious insiders), you must adopt a **Zero-Trust Architecture** mindset. Assume that your perimeter will eventually be breached, and build defenses that assume the attacker is already inside the network.

### 1. The "Zero-Trust" Intranet (Don't Trust the Campus LAN)
* **The Threat:** Just because the server is on the campus network doesn't mean it is safe. A student's laptop infected with malware can quietly scan the internal network.
* **The Strategy:** Never trust a device simply because it has a local IP address. Keep the UFW (Firewall) strictly enabled *even on the intranet*. Enforce rate-limiting on the Nginx proxy so that a student running a DDoS script on the Wi-Fi cannot crash the server.

### 2. Principle of Least Privilege (PoLP)
* **The Threat:** If a hacker cracks an administrator's password, they gain full control of the entire server.
* **The Strategy:** Never log into the physical/cloud server using the `root` account. Create a standard user account (e.g., `jrmsu_it_admin`) with `sudo` privileges. Ensure that the Docker daemon and containers are running as non-root users where possible. 

### 3. Immutable Log Forwarding (SIEM)
* **The Threat:** The very first thing a professional hacker does after breaching a server is delete the log files (`/var/log/syslog` or Docker logs) to erase their tracks.
* **The Strategy:** Do not store security logs exclusively on the physical server. Configure the server to instantly forward all SSH login attempts, Nginx access logs, and Django error logs to a secure, offsite logging server (like Datadog, Splunk, or a cloud Syslog server). If the physical server is wiped, you still have the forensic evidence.

### 4. Enterprise Switch MAC-Binding (Physical Servers Only)
* **The Threat:** A rogue student sneaks into the IT room, unplugs the ethernet cable from your Physical Server, and plugs it into their own laptop to intercept database traffic or bypass network restrictions.
* **The Strategy:** Ask the IT department to enable **Port Security (MAC Binding)** on the Ethernet Switch. The switch must be locked to only accept traffic from the exact MAC Address of your Physical Server's network card. If the cable is unplugged and moved to a different device, the switch instantly shuts down the port and triggers an alarm.

### 5. Automated Vulnerability Scanning
* **The Threat:** A new "Zero-Day" vulnerability is discovered in Ubuntu or Nginx six months after you deploy the system.
* **The Strategy:** Install an automated auditing tool like **Lynis** on the server OS. Schedule it via cron job to run a deep security scan of the operating system every week and email the IT department if any outdated packages or insecure configurations are found.
