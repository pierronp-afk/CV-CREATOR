✘ [ERROR] The symbol "A4Page" has already been declared

    <stdin>:567:6:
      567 │ const A4Page = ({ children, className = "" }) => (
          ╵       ~~~~~~

  The symbol "A4Page" was originally declared here:

    <stdin>:214:6:
      214 │ const A4Page = ({ children, className = "" }) => (
          ╵       ~~~~~~

✘ [ERROR] The symbol "CornerTriangle" has already been declared

    <stdin>:583:6:
      583 │ const CornerTriangle = ({ customLogo }) => (
          ╵       ~~~~~~~~~~~~~~

  The symbol "CornerTriangle" was originally declared here:

    <stdin>:230:6:
      230 │ const CornerTriangle = ({ customLogo }) => (
          ╵       ~~~~~~~~~~~~~~

✘ [ERROR] The symbol "HeaderSmall" has already been declared

    <stdin>:594:6:
      594 │ const HeaderSmall = ({ name, role }) => (
          ╵       ~~~~~~~~~~~

  The symbol "HeaderSmall" was originally declared here:

    <stdin>:241:6:
      241 │ const HeaderSmall = ({ name, role }) => (
          ╵       ~~~~~~~~~~~

✘ [ERROR] The symbol "Footer" has already been declared

    <stdin>:604:6:
      604 │ const Footer = () => (
          ╵       ~~~~~~

  The symbol "Footer" was originally declared here:

    <stdin>:251:6:
      251 │ const Footer = () => (
          ╵       ~~~~~~

Something went wrong, unable to compile code: Error: Build failed with 4 errors:
<stdin>:567:6: ERROR: The symbol "A4Page" has already been declared
<stdin>:583:6: ERROR: The symbol "CornerTriangle" has already been declared
<stdin>:594:6: ERROR: The symbol "HeaderSmall" has already been declared
<stdin>:604:6: ERROR: The symbol "Footer" has already been declared
    at failureErrorWithLog (/app/node_modules/esbuild/lib/main.js:1651:15)
    at /app/node_modules/esbuild/lib/main.js:1059:25
    at runOnEndCallbacks (/app/node_modules/esbuild/lib/main.js:1486:45)
    at buildResponseToResult (/app/node_modules/esbuild/lib/main.js:1057:7)
    at /app/node_modules/esbuild/lib/main.js:1086:16
    at responseCallbacks.<computed> (/app/node_modules/esbuild/lib/main.js:704:9)
    at handleIncomingPacket (/app/node_modules/esbuild/lib/main.js:764:9)
    at Socket.readFromStdout (/app/node_modules/esbuild/lib/main.js:680:7)
    at Socket.emit (node:events:518:28)
    at addChunk (node:internal/streams/readable:561:12) {
  errors: [Getter/Setter],
  warnings: [Getter/Setter]
}
Something went wrong, unable to compile code: Error: Build failed with 4 errors:
<stdin>:567:6: ERROR: The symbol "A4Page" has already been declared
<stdin>:583:6: ERROR: The symbol "CornerTriangle" has already been declared
<stdin>:594:6: ERROR: The symbol "HeaderSmall" has already been declared
<stdin>:604:6: ERROR: The symbol "Footer" has already been declared
    at failureErrorWithLog (/app/node_modules/esbuild/lib/main.js:1651:15)
    at /app/node_modules/esbuild/lib/main.js:1059:25
    at runOnEndCallbacks (/app/node_modules/esbuild/lib/main.js:1486:45)
    at buildResponseToResult (/app/node_modules/esbuild/lib/main.js:1057:7)
    at /app/node_modules/esbuild/lib/main.js:1086:16
    at responseCallbacks.<computed> (/app/node_modules/esbuild/lib/main.js:704:9)
    at handleIncomingPacket (/app/node_modules/esbuild/lib/main.js:764:9)
    at Socket.readFromStdout (/app/node_modules/esbuild/lib/main.js:680:7)
    at Socket.emit (node:events:518:28)
    at addChunk (node:internal/streams/readable:561:12) {
  errors: [Getter/Setter],
  warnings: [Getter/Setter]
}
