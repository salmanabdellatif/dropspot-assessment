import hashlib, sys
remote = sys.argv[1]
epoch = sys.argv[2]
start = sys.argv[3]
raw = f"{remote}|{epoch}|{start}"
print(hashlib.sha256(raw.encode()).hexdigest()[:12])