/**
 * Pagination Helper
 * يوفر دالة مساعدة لإضافة pagination لأي query
 */

/**
 * @desc    إضافة pagination لأي Mongoose query
 * @param   {Object} query - Mongoose query object
 * @param   {Object} req - Express request object
 * @param   {Number} defaultLimit - الحد الافتراضي لعدد النتائج (default: 10)
 * @returns {Object} - { query, pagination }
 */
export const paginate = (query, req, defaultLimit = 10) => {
  // استخراج page و limit من query parameters
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || defaultLimit;
  
  // التأكد من أن القيم صحيحة
  const validPage = page < 1 ? 1 : page;
  const validLimit = limit < 1 ? defaultLimit : limit > 100 ? 100 : limit;
  
  // حساب skip
  const skip = (validPage - 1) * validLimit;
  
  // تطبيق pagination على الـ query
  query.skip(skip).limit(validLimit);
  
  return {
    query,
    pagination: {
      page: validPage,
      limit: validLimit,
      skip
    }
  };
};

/**
 * @desc    إنشاء response object مع pagination metadata
 * @param   {Array} data - البيانات المسترجعة
 * @param   {Number} total - إجمالي عدد السجلات
 * @param   {Object} paginationInfo - معلومات الـ pagination من دالة paginate
 * @returns {Object} - Response object with pagination metadata
 */
export const paginationResponse = (data, total, paginationInfo) => {
  const { page, limit } = paginationInfo;
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null
    }
  };
};

/**
 * @desc    دالة مساعدة شاملة للـ pagination (تجمع الاثنين)
 * @param   {Model} Model - Mongoose model
 * @param   {Object} filter - Filter object for the query
 * @param   {Object} req - Express request object
 * @param   {Object} options - Additional options (populate, select, sort, defaultLimit)
 * @returns {Object} - { data, pagination }
 */
export const paginateQuery = async (Model, filter, req, options = {}) => {
  const {
    populate = null,
    select = null,
    sort = '-createdAt',
    defaultLimit = 10
  } = options;
  
  // إنشاء الـ query
  let query = Model.find(filter);
  
  // تطبيق select إذا وجد
  if (select) {
    query = query.select(select);
  }
  
  // تطبيق populate إذا وجد
  if (populate) {
    if (Array.isArray(populate)) {
      populate.forEach(pop => query = query.populate(pop));
    } else {
      query = query.populate(populate);
    }
  }
  
  // تطبيق sort
  if (sort) {
    query = query.sort(sort);
  }
  
  // الحصول على إجمالي العدد
  const total = await Model.countDocuments(filter);
  
  // تطبيق pagination
  const { query: paginatedQuery, pagination } = paginate(query, req, defaultLimit);
  
  // تنفيذ الـ query
  const data = await paginatedQuery;
  
  // إرجاع النتيجة مع metadata
  return paginationResponse(data, total, pagination);
};
