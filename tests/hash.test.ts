import * as hash from '@/hash'

const plain = '今、私はH&wNàáâãäÀÁÂÃÄ çÇ èéêëÈÉÊË ìíîïÌÍÎÏ ñÑ òóôõöÒÓÔÕÖ ùúûüÙÚÛÜ ýÿÝowIambecomDea*()\\][+={}/|:;"\'<>,.?-_th,th0e123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZdestroyerofworlds.अब मैं मृत्यु बन गया हूँ, संसारों का नाश करने वाला।`~!@#$%^&现在我变成了死神，世界的毁灭者。àáâãäÀÁÂÃÄ çÇ èéêëÈÉÊË �ìíîïÌÍÎÏ ñÑ òóôõöÒÓÔÕÖ ùúûüÙÚÛÜ ýÿÝ'
const dataset = {
  md5: '589194773f13933187e8cc11acc34f4f',
  sha1: 'b324253dcd2bbef451dc66edf53c0b0e723f31e6',
  sha256: 'c0b9520b919cc507dcbccbff9657495286df2e3e3933dbfd603ff397a6e10947',
  sha512: 'cb3e6edcceb6d6cb9ed3d8d6b9351adf9e9db3c9511781b7d45f7a589c92d880deb938a4438a7b3b4a5ed27c74388383b29879f6c03e1d0bebf95224a744b7fa',
}

describe('Hash', () => {
  it.each(Object.keys(dataset) as (keyof typeof dataset)[])('%s', (alg) => {
    expect(hash[alg](plain)).toBe(dataset[alg])
  })
})
