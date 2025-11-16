#!/bin/bash

# Script to check if all prerequisites are installed

echo "Checking prerequisites for Contested History Protocol..."
echo ""

# Check Rust
if command -v rustc &> /dev/null; then
    echo "✓ Rust installed: $(rustc --version)"
else
    echo "✗ Rust not installed"
    echo "  Install with: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
fi

# Check Cargo
if command -v cargo &> /dev/null; then
    echo "✓ Cargo installed: $(cargo --version)"
else
    echo "✗ Cargo not installed (should come with Rust)"
fi

# Check cargo-contract
if command -v cargo-contract &> /dev/null; then
    echo "✓ cargo-contract installed: $(cargo-contract --version)"
else
    echo "✗ cargo-contract not installed"
    echo "  Install with: cargo install cargo-contract --force"
fi

# Check substrate-contracts-node
if command -v substrate-contracts-node &> /dev/null; then
    echo "✓ substrate-contracts-node installed"
else
    echo "✗ substrate-contracts-node not installed"
    echo "  Install with: cargo install contracts-node --git https://github.com/paritytech/substrate-contracts-node.git --force"
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js installed: $NODE_VERSION"
    
    # Check if version is >= 18
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 18 ]; then
        echo "  Node.js version is compatible (>= 18)"
    else
        echo "  ⚠ Node.js version should be >= 18"
    fi
else
    echo "✗ Node.js not installed"
    echo "  Install from: https://nodejs.org/"
fi

# Check npm
if command -v npm &> /dev/null; then
    echo "✓ npm installed: $(npm --version)"
else
    echo "✗ npm not installed (should come with Node.js)"
fi

echo ""
echo "Prerequisites check complete!"
echo ""
echo "Next steps:"
echo "1. Install any missing prerequisites"
echo "2. Run 'cd frontend && npm install' to install frontend dependencies"
echo "3. See SETUP.md for detailed setup instructions"
