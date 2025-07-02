// Script keranjang sederhana
let cart = [];

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const checkoutBtn = document.getElementById('checkoutBtn');
    let totalQty = 0;
    cart.forEach(item => totalQty += item.qty || 1);
    if (cartCount) cartCount.textContent = totalQty;
    if (!cartItems || !checkoutBtn) return; // Jangan lanjut jika bukan di halaman utama
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-muted">Keranjang masih kosong.</p>';
        checkoutBtn.disabled = true;
        return;
    }
    let html = '<ul class="list-group mb-3">';
    let totalHarga = 0;
    cart.forEach((item, idx) => {
        const hargaNum = parseInt((item.harga||'').replace(/[^\d]/g, '')) || 0;
        totalHarga += hargaNum * (item.qty || 1);
        html += `<li class="list-group-item d-flex justify-content-between align-items-center">
            <span>${item.nama} <span class='text-secondary small'>(x${item.qty || 1})</span></span>
            <span class="badge bg-primary">${item.harga}</span>
            <button class="btn btn-sm btn-danger ms-2" onclick="removeFromCart(${idx})">Hapus</button>
        </li>`;
    });
    html += '</ul>';
    // Tambahkan total harga
    if (cart.length > 0) {
      html += `<div class='d-flex justify-content-between align-items-center mb-2 px-1'>
        <span class='fw-bold'>Total</span>
        <span class='fw-bold text-primary'>Rp${totalHarga.toLocaleString('id-ID')}</span>
      </div>`;
    }
    cartItems.innerHTML = html;
    checkoutBtn.disabled = false;
}

function addToCart(nama, harga, qty = 1) {
    const existingItem = cart.find(item => item.nama === nama && item.harga === harga);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ nama, harga, qty });
    }
    updateCartUI();
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartUI();
}

document.addEventListener('DOMContentLoaded', function() {
    // Tambahkan event pada tombol beli di produk
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const nama = this.getAttribute('data-nama');
            const harga = this.getAttribute('data-harga');
            // Cek jika ada input quantity di card produk (halaman detail)
            let qty = 1;
            const parent = this.closest('.card-body') || this.closest('.card');
            if (parent) {
                const qtyInput = parent.querySelector('#quantity');
                if (qtyInput) {
                    qty = parseInt(qtyInput.value) || 1;
                }
            }
            addToCart(nama, harga, qty);
        });
    });
    // Checkout ke halaman checkout.html
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.textContent = 'Checkout';
        checkoutBtn.addEventListener('click', function() {
            localStorage.setItem('cart', JSON.stringify(cart));
            window.location.href = 'checkout.html';
        });
    }
    updateCartUI();

    // Ringkasan belanja di checkout
    if (window.location.pathname.includes('checkout.html')) {
        const cartData = localStorage.getItem('cart');
        let totalHarga = 0;
        if (cartData) {
            const cart = JSON.parse(cartData);
            if (cart.length > 0) {
                let html = '<h5 class="mb-3">Ringkasan Belanja</h5><div class="row g-3 mb-4">';
                cart.forEach(item => {
                    const produk = produkList.find(p => p.nama === item.nama && p.harga === item.harga);
                    const hargaNum = parseInt((item.harga||'').replace(/[^\d]/g, '')) || 0;
                    totalHarga += hargaNum * (item.qty || 1);
                    html += `<div class='col-12'>
                      <div class='d-flex align-items-center border rounded p-2 bg-light'>
                        <img src='${produk ? produk.gambar : ''}' alt='${item.nama}' style='width:70px;height:70px;object-fit:cover;border-radius:8px;margin-right:16px;'>
                        <div class='flex-grow-1'>
                          <div class='fw-bold'>${item.nama}</div>
                          <div class='text-secondary small'>${produk ? produk.deskripsi : ''}</div>
                          <div class='mt-1'>Harga: <span class='fw-semibold text-primary'>${item.harga}</span> &nbsp; | &nbsp; Qty: <span class='fw-semibold'>${item.qty || 1}</span></div>
                        </div>
                      </div>
                    </div>`;
                });
                html += `</div><div class='d-flex justify-content-between align-items-center mb-4 px-1'>
                  <span class='fw-bold'>Total</span>
                  <span class='fw-bold text-primary'>Rp${totalHarga.toLocaleString('id-ID')}</span>
                </div>`;
                const form = document.getElementById('checkoutForm');
                if (form) form.insertAdjacentHTML('beforebegin', html);
            }
        }
        // Handler submit checkout
        const form = document.getElementById('checkoutForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                try {
                    // Simpan cart dan total harga ke sessionStorage untuk halaman sukses
                    const cartData = localStorage.getItem('cart');
                    if (cartData) sessionStorage.setItem('checkoutCart', cartData);
                    sessionStorage.setItem('checkoutTotal', totalHarga);
                    document.getElementById('checkoutMessage').innerHTML = '<div class="alert alert-success">Terima kasih! Pesanan Anda telah diterima. Kami akan segera menghubungi Anda untuk konfirmasi pembayaran.</div>';
                    localStorage.removeItem('cart');
                    this.reset();
                    setTimeout(function() {
                        window.location.href = 'pesanan-berhasil.html';
                    }, 1200);
                } catch (err) {
                    alert('Terjadi error saat proses checkout. Silakan refresh halaman.');
                }
            });
        }
    }

    // Fitur quantity di halaman detail produk
    function setupQuantityDetailProduk() {
      const qtyInput = document.getElementById('quantity');
      const btnMinus = document.getElementById('qtyMinus');
      const btnPlus = document.getElementById('qtyPlus');
      if (qtyInput && btnMinus && btnPlus) {
        btnMinus.onclick = function() {
          let val = parseInt(qtyInput.value) || 1;
          if (val > 1) qtyInput.value = val - 1;
        };
        btnPlus.onclick = function() {
          let val = parseInt(qtyInput.value) || 1;
          if (val < 99) qtyInput.value = val + 1;
        };
      }
      // Event handler tambah ke keranjang: pastikan tidak dobel
      document.querySelectorAll('.btn-add-cart').forEach(function(addCartBtn) {
        // Hapus event listener click sebelumnya (dengan cloneNode hack)
        const newBtn = addCartBtn.cloneNode(true);
        addCartBtn.parentNode.replaceChild(newBtn, addCartBtn);
        newBtn.addEventListener('click', function(e) {
          e.preventDefault();
          // Ambil qty dari input quantity jika ada
          let qty = 1;
          let setQty = false;
          if (qtyInput) {
            qty = parseInt(qtyInput.value) || 1;
            setQty = true;
          }
          const nama = this.getAttribute('data-nama');
          const harga = this.getAttribute('data-harga');
          if (typeof addToCart === 'function') {
            const existingItem = cart.find(item => item.nama === nama && item.harga === harga);
            if (existingItem && setQty) {
              existingItem.qty = qty;
              updateCartUI();
            } else {
              addToCart(nama, harga, qty);
            }
          } else {
            let cart = JSON.parse(localStorage.getItem('cart') || '[]');
            let idx = cart.findIndex(item => item.nama === nama && item.harga === harga);
            if (idx > -1 && setQty) {
              cart[idx].qty = qty;
            } else if (idx > -1) {
              cart[idx].qty += qty;
            } else {
              cart.push({ nama, harga, qty });
            }
            localStorage.setItem('cart', JSON.stringify(cart));
            alert('Produk berhasil ditambahkan ke keranjang!');
          }
        });
      });
    }
    setupQuantityDetailProduk();
});

// Data produk untuk produk-detail.html
const produkList = [
  {
    id: '1',
    nama: 'Tas Rajut Handmade',
    harga: 'Rp120.000',
    gambar: 'images/produk1.jpg',
    deskripsi: 'Tas rajut handmade dengan desain unik, cocok untuk berbagai suasana. Dibuat dari bahan berkualitas dan dikerjakan secara manual oleh pengrajin lokal. Tersedia dalam berbagai warna dan ukuran. Nyaman digunakan, ringan, dan tahan lama. Pilihan tepat untuk hadiah maupun penggunaan sehari-hari.'
  },
  {
    id: '2',
    nama: 'Vas Bunga Daur Ulang',
    harga: 'Rp85.000',
    gambar: 'images/produk2.jpg',
    deskripsi: 'Vas bunga ramah lingkungan yang terbuat dari bahan daur ulang. Cocok untuk mempercantik ruangan dan mendukung gerakan go green. Tersedia berbagai motif dan ukuran.'
  },
  {
    id: '3',
    nama: 'Miniatur Kayu Custom',
    harga: 'Rp150.000',
    gambar: 'images/produk3.jpg',
    deskripsi: 'Miniatur kayu dengan desain custom sesuai permintaan Anda. Cocok untuk hadiah, dekorasi, atau koleksi pribadi. Dikerjakan dengan detail dan presisi oleh pengrajin berpengalaman.'
  },
  {
    id: '4',
    nama: 'Dompet Anyaman Pandan',
    harga: 'Rp55.000',
    gambar: 'images/produk7.jpg',
    deskripsi: 'Dompet handmade dari daun pandan, ringan dan ramah lingkungan.'
  },
  {
    id: '5',
    nama: 'Gantungan Kunci Resin',
    harga: 'Rp25.000',
    gambar: 'images/produk8.jpg',
    deskripsi: 'Gantungan kunci unik dari resin, bisa custom nama/foto.'
  },
  {
    id: '6',
    nama: 'Lampu Hias Kayu',
    harga: 'Rp180.000',
    gambar: 'images/produk9.jpg',
    deskripsi: 'Lampu hias dari kayu daur ulang, cocok untuk dekorasi ruangan.'
  }
];
function getProdukId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id') || '1';
}
function tampilkanDetailProduk() {
  const id = getProdukId();
  const produk = produkList.find(p => p.id === id) || produkList[0];
  const img = document.getElementById('produkImg');
  const nama = document.getElementById('produkNama');
  const harga = document.getElementById('produkHarga');
  const deskripsi = document.getElementById('produkDeskripsi');
  if (img) { img.src = produk.gambar; img.alt = produk.nama; }
  if (nama) nama.textContent = produk.nama;
  if (harga) harga.textContent = produk.harga;
  if (deskripsi) deskripsi.textContent = produk.deskripsi;
  // Set data untuk tombol keranjang
  const addCartBtn = document.getElementById('addCartBtn');
  if (addCartBtn) {
    addCartBtn.setAttribute('data-nama', produk.nama);
    addCartBtn.setAttribute('data-harga', produk.harga);
  }
}
function setActiveNav() {
  const id = getProdukId();
  for (let i = 1; i <= 3; i++) {
    const nav = document.getElementById('nav' + i);
    if (nav) nav.classList.toggle('active', id === String(i));
  }
}
if (window.location.pathname.includes('produk-detail.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    tampilkanDetailProduk();
    setActiveNav();
    // Fitur quantity diatur dari js/script.js saja
  });
}

// Fitur GPS isi alamat otomatis di checkout
if (window.location.pathname.includes('checkout.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    const btnLokasi = document.getElementById('btnLokasi');
    if (btnLokasi) {
      btnLokasi.onclick = function() {
        const status = document.getElementById('lokasiStatus');
        status.textContent = 'Mengambil lokasi...';
        if (!navigator.geolocation) {
          status.textContent = 'Geolocation tidak didukung browser Anda.';
          status.className = 'form-text text-danger';
          return;
        }
        navigator.geolocation.getCurrentPosition(function(pos) {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Ganti proxy CORS agar fetch Nominatim bisa di localhost
          const url = `https://api.allorigins.win/raw?url=${encodeURIComponent('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng)}`;
          fetch(url)
            .then(r => r.json())
            .then(data => {
              if (data.display_name) {
                document.getElementById('alamat').value = data.display_name;
                status.textContent = 'Alamat berhasil diisi otomatis.';
                status.className = 'form-text text-success';
              } else {
                status.textContent = 'Gagal mendapatkan alamat.';
                status.className = 'form-text text-danger';
              }
            })
            .catch(() => {
              status.textContent = 'Gagal mendapatkan alamat.';
              status.className = 'form-text text-danger';
            });
        }, function() {
          status.textContent = 'Gagal mengakses lokasi.';
          status.className = 'form-text text-danger';
        });
      };
    }
  });
}

// Tampilkan detail produk di halaman pesanan-berhasil.html
document.addEventListener('DOMContentLoaded', function() {
  if (window.location.pathname.includes('pesanan-berhasil.html')) {
    const cart = JSON.parse(sessionStorage.getItem('checkoutCart') || '[]');
    const totalHarga = parseInt(sessionStorage.getItem('checkoutTotal') || '0');
    const div = document.getElementById('produkBerhasil');
    if (!cart.length || !div) return;
    let html = '<h5 class="mb-3">Detail Pesanan Anda</h5><div class="row g-3">';
    cart.forEach(item => {
      const produk = produkList.find(p => p.nama === item.nama && p.harga === item.harga);
      html += `<div class='col-12'>
        <div class='d-flex align-items-center border rounded p-2 bg-light'>
          <img src='${produk ? produk.gambar : ''}' alt='${item.nama}' style='width:70px;height:70px;object-fit:cover;border-radius:8px;margin-right:16px;'>
          <div class='flex-grow-1'>
            <div class='fw-bold'>${item.nama}</div>
            <div class='text-secondary small'>${produk ? produk.deskripsi : ''}</div>
            <div class='mt-1'>Harga: <span class='fw-semibold text-primary'>${item.harga}</span> &nbsp; | &nbsp; Qty: <span class='fw-semibold'>${item.qty || 1}</span></div>
          </div>
        </div>
      </div>`;
    });
    html += `</div><div class='d-flex justify-content-between align-items-center mt-4 px-1'>
      <span class='fw-bold'>Total</span>
      <span class='fw-bold text-primary'>Rp${totalHarga.toLocaleString('id-ID')}</span>
    </div>`;
    div.innerHTML = html;
  }
});