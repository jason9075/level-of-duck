{ pkgs ? import <nixpkgs> { } }:

let
in pkgs.mkShell {
  nativeBuildInputs = [
    pkgs.nodejs
    pkgs.entr
    pkgs.nodePackages.typescript
    pkgs.nodePackages.npm
    pkgs.nodePackages.http-server
  ];

  shellHook = ''
    echo "Nix env activated."
    echo "http-server installed. Run 'http-server' to start a server."
  '';
}
