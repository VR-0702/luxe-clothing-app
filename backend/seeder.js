/**
 * LUXE Database Seeder
 * Run: node seeder.js
 *
 * Users are saved one-by-one so the bcrypt pre-save hook runs.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User     = require('./models/User');
const Category = require('./models/Category');
const Product  = require('./models/Product');
const Coupon   = require('./models/Coupon');

const seed = async () => {
  await connectDB();
  console.log('\n🌱 Starting LUXE seeder...\n');

  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // ---- Users (one-by-one so pre-save bcrypt hook fires) ----
    await User.create({ name:'Admin User',    email:'admin@luxe.com',    password:'admin123',    role:'admin',    phone:'+91 98765 00001' });
    await User.create({ name:'Worker Staff',  email:'worker@luxe.com',   password:'worker123',   role:'worker',   phone:'+91 98765 00002' });
    await User.create({ name:'John Customer', email:'customer@luxe.com', password:'customer123', role:'customer', phone:'+91 98765 00003' });
    console.log('✅ Created 3 users');

    // ---- Categories ----
    const men    = await Category.create({ name:'Men',         sortOrder:1 });
    const women  = await Category.create({ name:'Women',       sortOrder:2 });
    const kids   = await Category.create({ name:'Kids',        sortOrder:3 });
    const acc    = await Category.create({ name:'Accessories', sortOrder:4 });
    const ethnic = await Category.create({ name:'Ethnic Wear', sortOrder:5 });
    console.log('✅ Created 5 categories');

    // ---- Products ----
    await Product.create({
      name:'Classic White Linen Shirt', price:2999, discountPrice:2499,
      shortDescription:'Breathable summer essential',
      description:'A timeless white linen shirt crafted for the modern gentleman. Perfect for casual and semi-formal occasions.',
      category:men._id, fabric:'100% Pure Linen', isFeatured:true,
      tags:['shirt','linen','summer'],
      variants:[
        {size:'S',color:'White',colorHex:'#FFFFFF',stock:15},
        {size:'M',color:'White',colorHex:'#FFFFFF',stock:20},
        {size:'L',color:'White',colorHex:'#FFFFFF',stock:12},
        {size:'S',color:'Black',colorHex:'#111111',stock:10},
        {size:'M',color:'Black',colorHex:'#111111',stock:18},
      ],
      images:[{url:'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',alt:'Linen Shirt',isPrimary:true}],
    });

    await Product.create({
      name:'Silk Evening Gown', price:12999, discountPrice:9999,
      shortDescription:'Effortless luxury for special occasions',
      description:'A stunning silk evening gown that drapes beautifully on every silhouette.',
      category:women._id, fabric:'100% Mulberry Silk', isFeatured:true,
      tags:['gown','silk','evening','formal'],
      variants:[
        {size:'XS',color:'Emerald',      colorHex:'#50C878',stock:5},
        {size:'S', color:'Emerald',      colorHex:'#50C878',stock:8},
        {size:'M', color:'Emerald',      colorHex:'#50C878',stock:6},
        {size:'S', color:'Midnight Blue',colorHex:'#191970',stock:4},
        {size:'M', color:'Midnight Blue',colorHex:'#191970',stock:7},
      ],
      images:[{url:'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600',alt:'Silk Gown',isPrimary:true}],
    });

    await Product.create({
      name:'Kashmiri Embroidered Kurta', price:5499,
      shortDescription:'Heritage craft meets modern comfort',
      description:'Hand-stitched by Kashmiri artisans, every motif tells a story of generations of craftsmanship.',
      category:ethnic._id, fabric:'Cotton with Kashmiri Embroidery', isFeatured:true,
      tags:['kurta','ethnic','embroidery'],
      variants:[
        {size:'S',color:'Ivory',  colorHex:'#FFFFF0',stock:6},
        {size:'M',color:'Ivory',  colorHex:'#FFFFF0',stock:10},
        {size:'L',color:'Ivory',  colorHex:'#FFFFF0',stock:8},
        {size:'M',color:'Saffron',colorHex:'#FF7F00',stock:5},
      ],
      images:[{url:'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600',alt:'Kurta',isPrimary:true}],
    });

    await Product.create({
      name:'Merino Wool Blazer', price:15999, discountPrice:13499,
      shortDescription:'Boardroom to bar — effortlessly',
      description:'Crafted from the finest Merino wool with a refined silhouette for professional and social settings.',
      category:men._id, fabric:'95% Merino Wool, 5% Cashmere', isFeatured:false,
      tags:['blazer','wool','formal'],
      variants:[
        {size:'M', color:'Charcoal',colorHex:'#36454F',stock:7},
        {size:'L', color:'Charcoal',colorHex:'#36454F',stock:5},
        {size:'XL',color:'Charcoal',colorHex:'#36454F',stock:3},
        {size:'M', color:'Navy',    colorHex:'#000080',stock:6},
      ],
      images:[{url:'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600',alt:'Blazer',isPrimary:true}],
    });

    await Product.create({
      name:'Floral Wrap Dress', price:3999, discountPrice:2999,
      shortDescription:'Effortless femininity for every season',
      description:'A versatile wrap dress with a vibrant floral print and adjustable tie waist.',
      category:women._id, fabric:'100% Viscose', isFeatured:true,
      tags:['dress','floral','casual','summer'],
      variants:[
        {size:'XS',color:'Rose',  colorHex:'#FF007F',stock:8},
        {size:'S', color:'Rose',  colorHex:'#FF007F',stock:12},
        {size:'M', color:'Rose',  colorHex:'#FF007F',stock:10},
        {size:'S', color:'Cobalt',colorHex:'#0047AB',stock:6},
        {size:'M', color:'Cobalt',colorHex:'#0047AB',stock:5},
      ],
      images:[{url:'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',alt:'Wrap Dress',isPrimary:true}],
    });

    await Product.create({
      name:'Slim Fit Chinos', price:2499,
      shortDescription:'Smart casual done right',
      description:'Slim-fit chinos in stretch cotton — comfort and style all day long.',
      category:men._id, fabric:'98% Cotton, 2% Elastane', isFeatured:false,
      tags:['chinos','trousers','casual'],
      variants:[
        {size:'S', color:'Khaki',colorHex:'#C3B091',stock:14},
        {size:'M', color:'Khaki',colorHex:'#C3B091',stock:20},
        {size:'L', color:'Khaki',colorHex:'#C3B091',stock:16},
        {size:'M', color:'Olive',colorHex:'#808000',stock:10},
        {size:'L', color:'Olive',colorHex:'#808000',stock:8},
      ],
      images:[{url:'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600',alt:'Chinos',isPrimary:true}],
    });

    console.log('✅ Created 6 products');

    // ---- Coupons ----
    await Coupon.create({
      code:'LUXE10', discountType:'percentage', discountValue:10,
      maxDiscount:500, minOrderAmount:999, isActive:true,
      validUntil: new Date(Date.now() + 90*24*60*60*1000),
    });
    await Coupon.create({
      code:'WELCOME500', discountType:'fixed', discountValue:500,
      minOrderAmount:2000, usageLimit:100, isActive:true,
      validUntil: new Date(Date.now() + 30*24*60*60*1000),
    });
    console.log('✅ Created 2 coupons');

    console.log('\n✨ Done! Login credentials:');
    console.log('   Admin:    admin@luxe.com    / admin123');
    console.log('   Worker:   worker@luxe.com   / worker123');
    console.log('   Customer: customer@luxe.com / customer123\n');

  } catch (err) {
    console.error('❌ Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
