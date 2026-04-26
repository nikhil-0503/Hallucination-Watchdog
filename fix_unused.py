import re

files = {
    'frontend/src/pages/ActivityLogs.js': [r'  Activity,\n'],
    'frontend/src/pages/AdminAnalysis.js': [r'  CheckCircle2,\n', r'  XCircle,\n'],
    'frontend/src/pages/AdminDashboard.js': [r'  Users,\n']
}

for path, patterns in files.items():
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    for pat in patterns:
        content = re.sub(pat, '', content)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'Fixed {path}')
