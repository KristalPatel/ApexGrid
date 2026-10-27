// Vite loads every image in the folder; the file name (without extension) is the driver code.
const files = import.meta.glob('../assets/drivers/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default',
})

const byCode = {}
for (const path in files) {
  const code = path.split('/').pop().split('.')[0].toUpperCase()
  byCode[code] = files[path]
}

export const getDriverImage = (code) => byCode[code?.toUpperCase()] || null