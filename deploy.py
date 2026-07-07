import paramiko, sys, time
sys.stdout.reconfigure(encoding="utf-8")

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect("145.79.58.122", port=65002, username="u892283443", password="Jrs@45@jrs")
sftp = ssh.open_sftp()

REMOTE_FRONTEND = "/home/u892283443/frontend"
REMOTE_LARAVEL_PUBLIC = "/home/u892283443/domains/darkslategrey-chough-173926.hostingersite.com/public_html"

print("Uploading standalone .next/...")
sftp.put(r"D:\BOUTIIQUE VASTRAA\standalone_dotnext.tar.gz", REMOTE_FRONTEND + "/dotnext.tar.gz")
stdin, stdout, stderr = ssh.exec_command("cd " + REMOTE_FRONTEND + " && tar -xzf dotnext.tar.gz && rm dotnext.tar.gz")
exit_code = stdout.channel.recv_exit_status()
print(f"  Extracted (exit: {exit_code})")

print("Uploading _next/static/...")
sftp.put(r"D:\BOUTIIQUE VASTRAA\next_static.tar.gz", REMOTE_LARAVEL_PUBLIC + "/static.tar.gz")
stdin, stdout, stderr = ssh.exec_command("mkdir -p " + REMOTE_LARAVEL_PUBLIC + "/_next && cd " + REMOTE_LARAVEL_PUBLIC + "/_next && tar -xzf ../static.tar.gz && rm ../static.tar.gz")
exit_code = stdout.channel.recv_exit_status()
print(f"  Extracted (exit: {exit_code})")

print("Uploading server.js...")
sftp.put(r"D:\BOUTIIQUE VASTRAA\.next\standalone\server.js", REMOTE_FRONTEND + "/server.js")
sftp.put(r"D:\BOUTIIQUE VASTRAA\.next\standalone\package.json", REMOTE_FRONTEND + "/package.json")
print("  Done")
sftp.close()

print("Restarting server...")
ssh.exec_command("pkill -f next-server 2>/dev/null")
time.sleep(1)
node = "/opt/alt/alt-nodejs20/root/usr/bin/node"
cmd = "cd " + REMOTE_FRONTEND + " && nohup env HOST=127.0.0.1 PORT=3099 " + node + " server.js > server.log 2>&1 &"
ssh.exec_command(cmd)
time.sleep(3)
stdin, stdout, stderr = ssh.exec_command("ps aux | grep next-server | grep -v grep")
out = stdout.read().decode()
if "next-server" in out:
    print("  Server running!")
else:
    print("  Server NOT running")
    stdin, stdout, stderr = ssh.exec_command("tail -30 " + REMOTE_FRONTEND + "/server.log")
    print("Log:", stdout.read().decode()[-500:])

ssh.close()
print("Deploy complete.")
