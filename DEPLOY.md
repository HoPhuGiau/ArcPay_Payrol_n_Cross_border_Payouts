# Hướng dẫn Deploy Contracts lên Arc Testnet

## Bước 1: Cài đặt Foundry

### Windows (PowerShell):
```powershell
# Tải và cài Foundry
irm https://foundry.paradigm.xyz | iex
foundryup
```

Sau khi cài xong, **restart PowerShell** và kiểm tra:
```powershell
forge --version
```

## Bước 2: Chuẩn bị Wallet và USDC

1. **Lấy Private Key từ MetaMask:**
   - MetaMask → Settings → Security & Privacy → Show Private Key
   - Copy private key (bắt đầu bằng `0x`)
   - **LƯU Ý:** Chỉ dùng testnet wallet, không dùng mainnet!

2. **Lấy Testnet USDC:**
   - Truy cập: https://faucet.circle.com
   - Chọn **Arc Testnet**
   - Paste địa chỉ wallet
   - Request USDC

## Bước 3: Setup .env file

Vào thư mục `contracts` và tạo/sửa file `.env`:

```powershell
cd d:\arc\contracts
```

Mở file `.env` và thêm:
```env
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
ARCSCAN_API_KEY=
```

**Thay `0xYOUR_PRIVATE_KEY_HERE` bằng private key của bạn**

## Bước 4: Compile Contracts

```powershell
cd d:\arc\contracts
forge build
```

Nếu thành công, bạn sẽ thấy: `Compiler run successful!`

## Bước 5: Test Contracts (Optional)

```powershell
forge test
```

## Bước 6: Deploy Contracts

```powershell
# Load environment variables
$env:ARC_TESTNET_RPC_URL = "https://rpc.testnet.arc.network"
$env:PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"  # Thay bằng private key của bạn

# Deploy
forge script script/Deploy.s.sol:DeployScript --rpc-url $env:ARC_TESTNET_RPC_URL --private-key $env:PRIVATE_KEY --broadcast
```

## Bước 7: Lưu Contract Addresses

Sau khi deploy thành công, bạn sẽ thấy:
```
CompanyRegistry deployed at: 0x...
PayrollManager deployed at: 0x...
```

**Copy 2 addresses này!**

## Bước 8: Cập nhật Frontend

Mở file `frontend\.env.local` và cập nhật:
```env
NEXT_PUBLIC_COMPANY_REGISTRY_ADDRESS=0x...  # Address từ bước 7
NEXT_PUBLIC_PAYROLL_MANAGER_ADDRESS=0x...  # Address từ bước 7
```

## Bước 9: Verify Contracts (Optional)

```powershell
# Verify CompanyRegistry
forge verify-contract \
  --chain-id 5042002 \
  --num-of-optimizations 200 \
  COMPANY_REGISTRY_ADDRESS \
  CompanyRegistry \
  --etherscan-api-key $env:ARCSCAN_API_KEY

# Verify PayrollManager
forge verify-contract \
  --chain-id 5042002 \
  --num-of-optimizations 200 \
  PAYROLL_MANAGER_ADDRESS \
  PayrollManager \
  --constructor-args $(cast abi-encode "constructor(address)" $COMPANY_REGISTRY_ADDRESS) \
  --etherscan-api-key $env:ARCSCAN_API_KEY
```

## Kiểm tra trên ArcScan

Sau khi deploy, kiểm tra trên:
- **ArcScan**: https://testnet.arcscan.app
- Paste contract address để xem chi tiết

---

## Troubleshooting

### Lỗi: "forge: command not found"
→ Cài Foundry: `irm https://foundry.paradigm.xyz | iex`

### Lỗi: "Insufficient funds"
→ Lấy thêm USDC từ faucet: https://faucet.circle.com

### Lỗi: "Invalid private key"
→ Kiểm tra private key có đúng format `0x...` không

### Lỗi: "Contract verification failed"
→ Có thể bỏ qua, contracts vẫn hoạt động bình thường

---

**Sau khi deploy xong, cập nhật frontend .env.local và test lại ứng dụng!**






