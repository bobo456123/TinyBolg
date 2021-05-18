'use strict';

const Controller = require('egg').Controller;

class ArchiveController extends Controller {

  async index() {
    const { ctx, service } = this;
    let archives = await service.content.getContents({ index: 1, pagesize: 20 });

    await ctx.render('list', { list: archives });
  }

  async show() {
    const { ctx, service, app, config } = this;
    let { cid } = ctx.params;
    let archive = await service.content.findOne(cid);
    //获取标签和分类
    var type = archive.meta.filter(meta => meta.type === "category");
    var tags = archive.meta.filter(meta => meta.type === "tag");
    archive.type = type[0];
    archive.tags = tags;

    //获取上一页、下一页
    archive.prev = await service.content.findSilbingOne(cid, "prev");
    archive.next = await service.content.findSilbingOne(cid, "next");

    //最新文章
    let lastestArchives = await service.content.getLastestContents(5);

    //分类
    let categorys = await service.meta.getAllCategory();

    //归档列表
    let earliestOneContent = await service.content.getEarliestOne();

    //获取评论
    let comments = await ctx.service.comment.getCommentByCid(cid);

    //获取最新评论
    let lareastComments = await ctx.service.comment.getLastestComments();

    // app.nunjucks.addFilter('shorten', function (str, count) {
    //   return str.toString().slice(0, count || 5);
    // });

    await ctx.render("archive", {
      archive,
      lastestArchives,
      categorys,
      comments,
      lareastComments,
      earliestMonth: ctx.helper.archiveMonth(ctx.helper.date(earliestOneContent.created))
    });
  }
}

module.exports = ArchiveController;
