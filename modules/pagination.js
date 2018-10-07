const pagination = function(data, currentPage) {
  // 資料數量
  const totalResult = data.length;
  // 每頁呈現數量
  const perpage = 3;
  // 總頁數
  const pageTotal = Math.ceil(totalResult / perpage);
  // 當前頁數過濾
  if (currentPage < 1) currentPage = 1;
  if (currentPage > pageTotal) currentPage = pageTotal;

  // 當下頁面需呈現資料位置換算
  // 該頁資料起始位置
  const minItem = currentPage * perpage - perpage + 1;
  // 該頁資料結束位置
  const maxItem = currentPage * perpage;
  // console.log(
  //   `總資料筆數:${totalResult}, 每頁呈現數量:${perpage}, 總頁數:${pageTotal}, 當前頁數:${currentPage}, 當前頁面第一筆:${minItem}, 當前頁面最後一筆${maxItem}`
  // );

  // 依據分頁條件印出資料
  let newData = [];
  data.forEach((item, index) => {
    let itemNum = index + 1;
    if (itemNum >= minItem && itemNum <= maxItem) {
      newData.push(item);
    }
  });
  const page = {
    pageTotal,
    currentPage
  };

  return {
    newData,
    page
  };
};

module.exports = pagination;
