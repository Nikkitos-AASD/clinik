from pathlib import Path
import re

root = Path("src")

for path in list(root.rglob("*.ts")) + list(root.rglob("*.tsx")):
    text = path.read_text(encoding="utf-8")
    original = text

    if "http://127.0.0.1:8000" not in text:
        continue

    text = re.sub(
        r"fetch\(\s*'http://127\.0\.0\.1:8000(/api/[^']*)'",
        r"fetch(apiClient.buildUrl('\1')",
        text,
    )

    text = re.sub(
        r'fetch\(\s*"http://127\.0\.0\.1:8000(/api/[^"]*)"',
        r'fetch(apiClient.buildUrl("\1")',
        text,
    )

    text = re.sub(
        r"`http://127\.0\.0\.1:8000\$\{photoUrl\}`",
        r"`${import.meta.env.VITE_API_URL}${photoUrl}`",
        text,
    )

    text = re.sub(
        r"const API_URL = 'http://127\.0\.0\.1:8000/api'",
        r"const API_URL = apiClient.buildUrl('/api')",
        text,
    )

    if text != original:
        if "apiClient.buildUrl(" in text and "apiClient" not in original:
            path_str = str(path)

            if path_str.endswith("src/app/api/auth.ts") or path_str.endswith("src/app/api/user.ts") or path_str.endswith("src/app/api/team.ts") or path_str.endswith("src/app/api/booking.ts"):
                text = "import { apiClient } from './client';\n" + text
            elif "/hooks/" in path_str or "/pages/" in path_str or "/components/" in path_str:
                text = "import { apiClient } from '../api/client';\n" + text

        path.write_text(text, encoding="utf-8")
        print(f"updated: {path}")