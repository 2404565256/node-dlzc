
const express = require('express')

const cookieSession = require('cookie-session')


const bodyParser = require('body-parser')
const path = require('path')
const db = require(path.join(__dirname, './utils/db'))

//导入验证包
const svgCaptcha = require('svg-captcha');

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))



app.set('trust proxy', 1) // trust first proxy

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}))


// 托管静态资源

app.use(express.static('static'))

//注册路由
app.post('/register', (req, res) => {
    const { username, password } = req.body
    const sql = `select * from user where username="${username}"`
    db.query({
        sql,
        callback(data) {
            if (data.length == 0) {
                const sqlInsert = `insert into user(username,password) values("${username}","${password}")`
                db.query({
                    sql: sqlInsert,
                    callback(results) {
                        //   console.log(results);        
                        if (results.affectedRows == 1) {
                            res.send({
                                code: 200,
                                msg: '恭喜你注册成功'
                            })
                        }
                    }
                })
            } else {
                res.send({
                    code: 400,
                    msg: '用户已注册信息'
                })
            }
        }
    })
})

//登录路由
app.post('/login', (req, res) => {
    const { username, password, vCode } = req.body
    if (vCode == req.session.captcha) {
        const sql = `select * from user where username="${username}" and password="${password}"`
        db.query({
            sql,
            callback(data) {
                if (data.length == 0) {
                    res.send({
                        code: 400,
                        msg: '用户名或密码错误'
                    })
                } else if (data.length == 1) {
                    res.send({
                        code: 200,
                        msg: '登录成功'
                    })
                }
            }
        })
    } else {
        res.send({
            msg: '验证码错误',
            code: 400
        })
    }
})

//验证码路由
app.get('/captcha', function (req, res) {
    var captcha = svgCaptcha.create();
    console.log(captcha.text);

    req.session.captcha = captcha.text;

    res.type('svg');
    res.status(200).send(captcha.data);
});


//开启监听
app.listen(3000)