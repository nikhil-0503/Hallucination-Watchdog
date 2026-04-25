import re

with open('frontend/src/pages/ActivityLogs.js', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace(',\n  Activity\n', '\n')
with open('frontend/src/pages/ActivityLogs.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed ActivityLogs.js - removed Activity import')

with open('frontend/src/pages/AdminAnalysis.js', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('  CheckCircle2,\n', '').replace('  XCircle,\n', '')
with open('frontend/src/pages/AdminAnalysis.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed AdminAnalysis.js - removed CheckCircle2, XCircle imports')

with open('frontend/src/pages/AdminDashboard.js', 'r', encoding='utf-8') as f:
    content = f.read()
content = content.replace('  Users,\n', '')
with open('frontend/src/pages/AdminDashboard.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed AdminDashboard.js - removed Users import')
