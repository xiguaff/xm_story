const express = require("express");

//引入连接池
const pool = require("./pool.js")

//创建路由器
var router = express.Router();

//功能1：用户注册
router.post("/reg",(req,res)=>{
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    var regTime = req.body.regTime;
    console.log(uname,upwd,regTime)
    var sql=`INSERT INTO story_user VALUES(NULL,${uname},md5("${upwd}"),'${regTime}',NULL,'Icon/defaultIcon.jpg')`;
    pool.query(sql,(err,result)=>{
        if(err) throw err;
        res.send({code:1,msg:"注册成功"});
    });
});


//功能2：用户登录
router.get("/login",(req,res)=>{
    var uname=req.query.uname;
    var upwd=req.query.upwd;
    console.log(uname,upwd);
    var sql=`SELECT uid,uname,nickName FROM story_user WHERE uname=? AND upwd=md5(?)`;
    pool.query(sql,[uname,upwd],(err,result)=>{
        if(err) throw err;
        console.log(result)
        if(result.length==0){
            res.send({code:-1,msg:"用户名或密码错误"});
        }else{
            req.session.uid=result[0].uid;
			req.session.uname=result[0].uname;
			req.session.nickName=result[0].nickName;
            console.log(req.session);
            res.send({code:1,msg:"登录成功",data:[result[0].uname,result[0].nickName]});
        };
    });
});

//功能3：获取已登录用户名
router.get("/getname",(req,res)=>{
    var uname=req.session.uname;
    if(uname){
        res.send({code:1,data:uname});
    }else{
        res.send({code:-1,msg:"未登录"});
    }
})


//功能4：用户点击退出登录
router.get("/outlogin",(req,res)=>{
    req.session.uid=null;
	req.session.uname=null;
    res.send({code:1,msg:"退出成功"});
});

//功能5：获取图书列表
router.get("/list",(req,res)=>{
    var fid=req.query.fid;
    var sql=`SELECT * FROM story_detail WHERE family_id=?`;
    pool.query(sql,[fid],(err,result)=>{
        if(err) throw err;
        res.send({code:1,meg:"请求成功",data:result});
    });
});

//功能6：获取图书详情
router.get("/detail",(req,res)=>{
	var sid = req.query.sid;
	var resu=[];
	var sql=`SELECT * FROM story_detail WHERE sid=?`;
	pool.query(sql,[sid],(err,result)=>{
		if(err) throw err;
		resu[0]=result;
		var family_id=result[0].family_id;
		var sql=`SELECT fname FROM story_family WHERE fid=?`;
		pool.query(sql,[family_id],(err,result)=>{
			if(err) throw err;
			resu[1]=result;
			res.send({code:1,msg:"执行成功",data:resu});
		});
	});
});

//功能7:用户书架
router.post("/userBook",(req,res)=>{
	var uid = req.session.uid;
	if(!uid){
		res.send({code:-1,msg:"请先登录"});
		return;
	}
	var obj = req.body;
		obj["uid"]=uid;
	var sql = `INSERT INTO story_bookShelf SET ?`;
	pool.query(sql,[obj],(err,result)=>{
		if(err) throw err;
		res.send({code:1,msg:"加入成功"});	
	});

});

//功能8:判断是否加入书架
router.get("/getBookShelf",(req,res)=>{
	var sid = req.query.sid;
	var uid = req.session.uid;
	console.log(sid,uid)
	var sql = `SELECT bid FROM story_bookShelf WHERE sid=? AND uid=?`;
	pool.query(sql,[sid,uid],(err,result)=>{
		if(err) throw err;
		console.log(result)
		if(result.length>0){
			res.send({code:1,msg:"已在书架"});
		}else{
			res.send({code:-1,msg:"未在书架"});
		}
	});
});


//功能9：分页查询个人书架
router.get("/selBook",(req,res)=>{
	var uid = req.session.uid;
	console.log(uid)
	var pn = req.query.pageNum;
	var ps = req.query.pageSize;
	console.log(req.query)
	if(pn==0){pn=1};
	if(ps==0){ps=3};
	var obj = {
		pCount:0,
		data:{}
	};
	var start = (pn-1)*ps;
	ps=parseInt(ps);
	var sql=`SELECT bid FROM story_bookShelf WHERE uid=?`;
	pool.query(sql,[uid],(err,result)=>{
		if(err) throw err;
        obj.pCount = Math.ceil(result.length/ps);
		var sql = `SELECT bid,sid,bname,story_family,newchapter,author,joinTime FROM story_bookShelf WHERE uid=? LIMIT ?,?`;
		pool.query(sql,[uid,start,ps],(err,result)=>{
			if(err) throw err;
			obj.data=result;
			res.send({code:1,msg:"查询成功",data:obj})
		})
	});

});


//功能10：获取登录用户个人信息
router.get("/getInfo",(req,res)=>{
	var uid = req.session.uid;
	var sql = `SELECT uname,regTime,nickName,Icon FROM story_user WHERE uid=?`;
	pool.query(sql,[uid],(err,result)=>{
		if(err) throw err;
		res.send({code:1,msg:"请求成功",data:result});
	})
});


//功能11：修改用户昵称
router.post("/nickName",(req,res)=>{
	var uid = req.session.uid;
	var nickName = req.body.nickName;
	var sql = `UPDATE story_user SET nickName=? WHERE uid=?`;
	pool.query(sql,[nickName,uid],(err,result)=>{
		if(err) throw err;
		res.send({code:1,msg:"修改成功"});
	})
});

//功能12：修改用户名
 router.post("/setName",(req,res)=>{
	 var uid = req.session.uid;
	 var uname = req.body.uname;
	 console.log(uname)
	 var sql = `UPDATE story_user SET uname=? WHERE uid=?`;
	 pool.query(sql,[uname,uid],(err,result)=>{
		if(err) throw err;
		res.send({code:1,msg:"修改成功"});
	 });
 })


 //功能13：删除书架单个书本
 router.get("/delBook",(req,res)=>{
	 var sid = req.query.sid;
	 var uid = req.session.uid;
	 var sql = `DELETE FROM story_bookShelf WHERE sid=? AND uid=?`;
	 pool.query(sql,[sid,uid],(err,result)=>{
		 if(err) throw err;
		 if(result.affectedRows>0){
			res.send({code:1,msg:"删除成功"});
		 }else{
			res.send({code:-1,msg:"删除失败"});
		 }
	 });
 });

 //功能14：详情页图书推荐列表
 router.get("/recomlist",(req,res)=>{
	 var data=[];
	 var sql = `SELECT sid,bname,family_id,author,imgUrl FROM story_detail WHERE sid<40 ORDER BY collect ASC`;
	 pool.query(sql,(err,result)=>{
		if(err) throw err;
		data[0]=result;
		var sql = `SELECT fname FROM story_family`;
		pool.query(sql,(err,result)=>{
			if(err) throw err;
			data[1]=result;
			res.send({code:1,msg:"执行成功",data:data});
		});
	 });
 });

 //首页获取商品列表
 router.get("/getIndex",(req,res)=>{
	 var data=[];
	 var sql = `SELECT sid,bname,author,imgUrl,family_id FROM story_detail`;
	 pool.query(sql,(err,result)=>{
		 if(err) throw err;
		 data[0]=result;
		 var sql = `SELECT fname FROM story_family`;
		 pool.query(sql,(err,result)=>{
			 if(err) throw err;
			 data[1]=result;
			 res.send({code:1,msg:"执行成功",data:data});
		 });
	 });
});
// router.get("/select",(req,res)=>{
//     var uid=req.params.uid;
//     var sql="select * from story_user where uid=?";
//     pool.query(sql,[uid],(err,resulr)=>{
//         if(err) throw err;
//         res.send({code:1,msg:"查询成功"});
//     })
// })
module.exports=router;