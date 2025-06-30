import * as crypto from 'crypto';

const publicKey = Buffer.from('LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUZ3d0RRWUpLb1pJaHZjTkFRRUJCUUFEU3dBd1NBSkJBTGovK3VBUzdtU2Zqdzl0UlRGNE1Fa2V5Z0lpa2Jkd3RpbGJLeW9EWFVZRFpqUGtpR3FFTzNsY3JBYitMaUc0MUl1aHFUNGU0Z3ZZQ0YxRG8vT3hBb2tDQXdFQUFRPT0KLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0t', 'base64').toString('utf-8');

export function decrypt(encryptedText: string): string {
  try {
    // 将 base64 解码为 Buffer
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');
    
    // 使用 Node.js crypto 模块进行 RSA 公钥操作
    const decryptedBuffer = crypto.publicDecrypt(
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      encryptedBuffer
    );
    
    // 移除 PKCS#1 填充
    const removePadding = (data: Buffer): string => {
      const bytes = Array.from(data);
      
      // 寻找填充结束的位置
      let startIndex = 0;
      
      // 跳过开头的 0x00
      while (startIndex < bytes.length && bytes[startIndex] === 0x00) {
        startIndex++;
      }
      
      // 跳过 0x01
      if (startIndex < bytes.length && bytes[startIndex] === 0x01) {
        startIndex++;
      }
      
      // 跳过填充字节 (0xFF)
      while (startIndex < bytes.length && bytes[startIndex] === 0xFF) {
        startIndex++;
      }
      
      // 跳过分隔符 0x00
      if (startIndex < bytes.length && bytes[startIndex] === 0x00) {
        startIndex++;
      }
      
      // 提取实际数据并转换为字符串
      return Buffer.from(bytes.slice(startIndex)).toString('utf8');
    };
    
    return removePadding(decryptedBuffer);
    
  } catch (error: any) {
    throw new Error(`解密失败: ${error.message}`);
  }
}