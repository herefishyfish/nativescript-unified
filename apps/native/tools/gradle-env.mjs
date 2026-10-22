// The CLI spawns a bare `gradlew.bat` through cmd.exe with cwd set to the Gradle project. Hosts such as VS Code
// and Claude Code set NoDefaultCurrentDirectoryInExePath, which stops cmd.exe from resolving commands in the cwd,
// so the build fails with "'gradlew.bat' is not recognized". Hooks run in the CLI process, so clearing it here
// reaches every Gradle spawn.
export default function () {
  delete process.env.NoDefaultCurrentDirectoryInExePath;
}
