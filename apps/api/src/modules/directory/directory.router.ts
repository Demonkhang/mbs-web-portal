import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '@mbs/database';
import { sendApiResponse } from '../../common/interceptors/response.interceptor';
import { JwtAuthGuard, RolesGuard } from '../../common/guards/roles.guard';

export const directoryRouter = Router();

// Dữ liệu mẫu danh bạ ban đầu nếu CSDL trống (Auto-seed)
const DEFAULT_UNITS = [
  {
    code: 'BGD',
    name: 'Ban Giám đốc MBS',
    address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 1234',
    email: 'bql.mbs@tphcm.gov.vn',
    sortOrder: 1,
    isActive: true,
  },
  {
    code: 'VPB',
    name: 'Văn phòng Ban Quản lý',
    address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 5566',
    email: 'vanphong.mbs@tphcm.gov.vn',
    sortOrder: 2,
    isActive: true,
  },
  {
    code: 'PKHTC',
    name: 'Phòng Kế hoạch - Tài chính',
    address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 5566',
    email: 'kehoach.mbs@tphcm.gov.vn',
    sortOrder: 3,
    isActive: true,
  },
  {
    code: 'PQLKT',
    name: 'Phòng Quản lý Kỹ thuật & Công nghệ',
    address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 5566',
    email: 'kythuat.mbs@tphcm.gov.vn',
    sortOrder: 4,
    isActive: true,
  },
  {
    code: 'PGSMT',
    name: 'Phòng Giám sát Môi trường',
    address: 'Số 40 Võ Thị Sáu, Phường Tân Định, Quận 1, TP. Hồ Chí Minh',
    phone: '(028) 3822 5566',
    email: 'giamsat.mbs@tphcm.gov.vn',
    sortOrder: 5,
    isActive: true,
  },
  {
    code: 'TGD-DP',
    name: 'Trạm Giám sát Hiện trường Đa Phước (Bình Chánh)',
    address: 'QL50, Xã Đa Phước, Huyện Bình Chánh, TP.HCM',
    phone: '(028) 3778 1234',
    email: 'tramdaphuoc.mbs@tphcm.gov.vn',
    sortOrder: 6,
    isActive: true,
  },
  {
    code: 'TGD-PH',
    name: 'Trạm Giám sát Hiện trường Phước Hiệp (Củ Chi)',
    address: 'Ấp 4, Xã Phước Hiệp, Huyện Củ Chi, TP.HCM',
    phone: '(028) 3792 5678',
    email: 'tramphuochiep.mbs@tphcm.gov.vn',
    sortOrder: 7,
    isActive: true,
  },
];

const DEFAULT_STAFFS = [
  {
    unitCode: 'BGD',
    fullName: 'Nguyễn Văn Minh',
    position: 'Trưởng ban Quản lý',
    phone: '(028) 3822 5566',
    extension: '101',
    email: 'minhnv.mbs@tphcm.gov.vn',
    duties: 'Phụ trách chung toàn bộ hoạt động của Ban; trực tiếp chỉ đạo công tác quy hoạch, kế hoạch đầu tư, tổ chức cán bộ, tài chính ngân sách.',
    sortOrder: 1,
    isActive: true,
  },
  {
    unitCode: 'BGD',
    fullName: 'Lê Thị Thu Hằng',
    position: 'Phó Trưởng ban (Phụ trách Kỹ thuật)',
    phone: '(028) 3822 5566',
    extension: '102',
    email: 'hangltt.mbs@tphcm.gov.vn',
    duties: 'Trực tiếp chỉ đạo công tác quản lý kỹ thuật, công nghệ xử lý rác thải, bảo vệ môi trường, vận hành các trạm quan trắc tự động.',
    sortOrder: 2,
    isActive: true,
  },
  {
    unitCode: 'BGD',
    fullName: 'Trần Đình Quân',
    position: 'Phó Trưởng ban (Phụ trách Kế hoạch - ĐTXD)',
    phone: '(028) 3822 5566',
    extension: '103',
    email: 'quantd.mbs@tphcm.gov.vn',
    duties: 'Chỉ đạo kế hoạch vốn đầu tư công, giải phóng mặt bằng và đầu tư hạ tầng dùng chung tại các Khu xử lý.',
    sortOrder: 3,
    isActive: true,
  },
  {
    unitCode: 'VPB',
    fullName: 'Võ Hoàng Nam',
    position: 'Chánh Văn phòng',
    phone: '(028) 3822 5566',
    extension: '201',
    email: 'namvh.mbs@tphcm.gov.vn',
    duties: 'Điều hành công tác hành chính, văn thư lưu trữ, quản trị nội bộ và tổ chức bộ máy.',
    sortOrder: 4,
    isActive: true,
  },
  {
    unitCode: 'VPB',
    fullName: 'Phạm Thanh Sơn',
    position: 'Phó Chánh Văn phòng',
    phone: '(028) 3822 5566',
    extension: '202',
    email: 'sonpt.mbs@tphcm.gov.vn',
    duties: 'Phụ trách thi đua khen thưởng, CNTT và chuyển đổi số.',
    sortOrder: 5,
    isActive: true,
  },
  {
    unitCode: 'PKHTC',
    fullName: 'Ngô Đức Thắng',
    position: 'Trưởng phòng Kế hoạch - Tài chính',
    phone: '(028) 3822 5566',
    extension: '301',
    email: 'thangnd.mbs@tphcm.gov.vn',
    duties: 'Chủ trì lập kế hoạch tài chính, lập dự toán ngân sách và quản lý tài sản công.',
    sortOrder: 6,
    isActive: true,
  },
  {
    unitCode: 'PKHTC',
    fullName: 'Đoàn Kim Oanh',
    position: 'Kế toán trưởng',
    phone: '(028) 3822 5566',
    extension: '302',
    email: 'oanhdk.mbs@tphcm.gov.vn',
    duties: 'Chịu trách nhiệm kế toán, thanh quyết toán hợp đồng xử lý chất thải.',
    sortOrder: 7,
    isActive: true,
  },
  {
    unitCode: 'PQLKT',
    fullName: 'Hoàng Quốc Việt',
    position: 'Trưởng phòng Quản lý Kỹ thuật & Công nghệ',
    phone: '(028) 3822 5566',
    extension: '401',
    email: 'viethq.mbs@tphcm.gov.vn',
    duties: 'Quản lý quy chuẩn kỹ thuật công nghệ xử lý rác, đốt rác phát điện WtE.',
    sortOrder: 8,
    isActive: true,
  },
  {
    unitCode: 'PQLKT',
    fullName: 'Trần Văn Long',
    position: 'Phó Trưởng phòng Quản lý Kỹ thuật',
    phone: '(028) 3822 5566',
    extension: '402',
    email: 'longtv.mbs@tphcm.gov.vn',
    duties: 'Giám sát hạ tầng kỹ thuật đường xá, hệ thống thoát nước tại các Khu LHXLCT.',
    sortOrder: 9,
    isActive: true,
  },
  {
    unitCode: 'PGSMT',
    fullName: 'Đỗ Anh Tuấn',
    position: 'Trưởng phòng Giám sát Môi trường',
    phone: '(028) 3822 5566',
    extension: '501',
    email: 'tuanda.mbs@tphcm.gov.vn',
    duties: 'Chỉ đạo công tác quan trắc môi trường tự động 24/7 và kiểm soát mùi hôi.',
    sortOrder: 10,
    isActive: true,
  },
  {
    unitCode: 'TGD-DP',
    fullName: 'Lê Minh Trí',
    position: 'Đội trưởng Trạm Giám sát Đa Phước (24/7)',
    phone: '(028) 3778 1234',
    extension: '601',
    email: 'tramdaphuoc.mbs@tphcm.gov.vn',
    duties: 'Trực ban 24/7 tiếp nhận rác và kiểm soát cân xe tại Khu LHXLCT Đa Phước.',
    sortOrder: 11,
    isActive: true,
  },
  {
    unitCode: 'TGD-PH',
    fullName: 'Vũ Đức Thành',
    position: 'Đội trưởng Trạm Giám sát Phước Hiệp (24/7)',
    phone: '(028) 3792 5678',
    extension: '701',
    email: 'tramphuochiep.mbs@tphcm.gov.vn',
    duties: 'Trực ban 24/7 tiếp nhận rác và giám sát phân loại rác tại Khu LHXLCT Phước Hiệp.',
    sortOrder: 12,
    isActive: true,
  },
];

let hasCheckedSeed = false;

async function ensureSeedData() {
  if (hasCheckedSeed) return;
  hasCheckedSeed = true;

  const count = await prisma.directoryUnit.count();
  if (count === 0) {
    console.log('Seeding initial directory data...');
    for (const unitData of DEFAULT_UNITS) {
      const createdUnit = await prisma.directoryUnit.create({
        data: unitData,
      });

      // Create a default matching department for each unit
      const createdDept = await prisma.directoryDepartment.create({
        data: {
          unitId: createdUnit.id,
          code: `DEPT-${createdUnit.code}`,
          name: createdUnit.name,
          phone: createdUnit.phone,
          email: createdUnit.email,
          sortOrder: 1,
          isActive: true,
        },
      });

      // Seed staff belonging to this unit
      const staffsForUnit = DEFAULT_STAFFS.filter((s) => s.unitCode === unitData.code);
      for (const staff of staffsForUnit) {
        await prisma.directoryStaff.create({
          data: {
            unitId: createdUnit.id,
            departmentId: createdDept.id,
            fullName: staff.fullName,
            position: staff.position,
            phone: staff.phone,
            extension: staff.extension,
            email: staff.email,
            duties: staff.duties,
            sortOrder: staff.sortOrder,
            isActive: staff.isActive,
          },
        });
      }
    }
    console.log('Directory seed completed successfully.');
  }
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -------------------------------------------------------------

// GET /api/v1/directory/public - Dynamic directory hierarchy for public front-end
directoryRouter.get('/public', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedData();

    const units = await prisma.directoryUnit.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        departments: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            staffs: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        staffs: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sendApiResponse(res, units, 'Danh bạ điện tử công khai từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/directory/staff - List or search staff members
directoryRouter.get('/staff', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedData();

    const { q, unitId, departmentId, includeInactive } = req.query;

    const whereClause: any = {};
    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }
    if (unitId) {
      whereClause.unitId = String(unitId);
    }
    if (departmentId) {
      whereClause.departmentId = String(departmentId);
    }
    if (q) {
      const searchTerm = String(q).trim();
      whereClause.OR = [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { position: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
        { extension: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const staffs = await prisma.directoryStaff.findMany({
      where: whereClause,
      include: {
        unit: true,
        department: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return sendApiResponse(res, staffs, 'Danh sách cán bộ nhân sự từ CSDL PostgreSQL');
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT API ENDPOINTS (UNITS & DEPARTMENTS & STAFF)
// -------------------------------------------------------------

// GET /api/v1/directory/units
directoryRouter.get('/units', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await ensureSeedData();
    const units = await prisma.directoryUnit.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        departments: true,
        _count: { select: { staffs: true } },
      },
    });
    return sendApiResponse(res, units, 'Danh sách đơn vị từ CSDL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/directory/units
directoryRouter.post(
  '/units',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, name, address, phone, email, sortOrder, isActive } = req.body;
      if (!code || !name) {
        return res.status(400).json({
          title: 'Bad Request',
          status: 400,
          detail: 'Mã đơn vị và Tên đơn vị là bắt buộc.',
        });
      }

      const newUnit = await prisma.directoryUnit.create({
        data: {
          code: String(code).trim().toUpperCase(),
          name: String(name).trim(),
          address: address ? String(address).trim() : null,
          phone: phone ? String(phone).trim() : null,
          email: email ? String(email).trim() : null,
          sortOrder: Number(sortOrder) || 0,
          isActive: isActive !== false,
        },
      });

      return sendApiResponse(res, newUnit, 'Tạo mới Đơn vị thành công', 201);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/directory/units/:id
directoryRouter.put(
  '/units/:id',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { code, name, address, phone, email, sortOrder, isActive } = req.body;

      const updated = await prisma.directoryUnit.update({
        where: { id },
        data: {
          code: code ? String(code).trim().toUpperCase() : undefined,
          name: name ? String(name).trim() : undefined,
          address: address !== undefined ? String(address).trim() : undefined,
          phone: phone !== undefined ? String(phone).trim() : undefined,
          email: email !== undefined ? String(email).trim() : undefined,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        },
      });

      return sendApiResponse(res, updated, 'Cập nhật thông tin Đơn vị thành công');
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/directory/units/:id
directoryRouter.delete(
  '/units/:id',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Gỡ liên kết Đơn vị & Phòng ban của cán bộ thuộc Đơn vị này trước
      await prisma.directoryStaff.updateMany({
        where: { unitId: id },
        data: { unitId: null, departmentId: null },
      });
      // Xóa các phòng ban trực thuộc đơn vị này
      await prisma.directoryDepartment.deleteMany({
        where: { unitId: id },
      });
      // Xóa đơn vị
      await prisma.directoryUnit.delete({ where: { id } });
      return sendApiResponse(res, { id, deleted: true }, 'Xóa Đơn vị thành công');
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/directory/departments
directoryRouter.get('/departments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { unitId } = req.query;
    const whereClause: any = {};
    if (unitId) {
      whereClause.unitId = String(unitId);
    }

    const depts = await prisma.directoryDepartment.findMany({
      where: whereClause,
      include: {
        unit: true,
        _count: { select: { staffs: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return sendApiResponse(res, depts, 'Danh sách phòng ban từ CSDL');
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/directory/departments
directoryRouter.post(
  '/departments',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unitId, code, name, phone, email, sortOrder, isActive } = req.body;
      if (!unitId || !code || !name) {
        return res.status(400).json({
          title: 'Bad Request',
          status: 400,
          detail: 'Đơn vị trực thuộc, Mã phòng và Tên phòng ban là bắt buộc.',
        });
      }

      const newDept = await prisma.directoryDepartment.create({
        data: {
          unitId: String(unitId),
          code: String(code).trim().toUpperCase(),
          name: String(name).trim(),
          phone: phone ? String(phone).trim() : null,
          email: email ? String(email).trim() : null,
          sortOrder: Number(sortOrder) || 0,
          isActive: isActive !== false,
        },
      });

      return sendApiResponse(res, newDept, 'Tạo mới Phòng ban thành công', 201);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/directory/departments/:id
directoryRouter.put(
  '/departments/:id',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { unitId, code, name, phone, email, sortOrder, isActive } = req.body;

      const updated = await prisma.directoryDepartment.update({
        where: { id },
        data: {
          unitId: unitId ? String(unitId) : undefined,
          code: code ? String(code).trim().toUpperCase() : undefined,
          name: name ? String(name).trim() : undefined,
          phone: phone !== undefined ? String(phone).trim() : undefined,
          email: email !== undefined ? String(email).trim() : undefined,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        },
      });

      return sendApiResponse(res, updated, 'Cập nhật Phòng ban thành công');
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/directory/departments/:id
directoryRouter.delete(
  '/departments/:id',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      // Gỡ liên kết phòng ban của cán bộ thuộc phòng này trước khi xóa
      await prisma.directoryStaff.updateMany({
        where: { departmentId: id },
        data: { departmentId: null },
      });
      // Xóa phòng ban khỏi CSDL
      await prisma.directoryDepartment.delete({ where: { id } });
      return sendApiResponse(res, { id, deleted: true }, 'Xóa Phòng ban thành công');
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/directory/staff - Create Staff member
directoryRouter.post(
  '/staff',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { unitId, departmentId, fullName, position, phone, extension, email, avatarUrl, duties, sortOrder, isActive } = req.body;

      if (!fullName || !position) {
        return res.status(400).json({
          title: 'Bad Request',
          status: 400,
          detail: 'Họ tên cán bộ và Chức vụ là trường bắt buộc.',
        });
      }

      const newStaff = await prisma.directoryStaff.create({
        data: {
          unitId: unitId ? String(unitId) : null,
          departmentId: departmentId ? String(departmentId) : null,
          fullName: String(fullName).trim(),
          position: String(position).trim(),
          phone: phone ? String(phone).trim() : null,
          extension: extension ? String(extension).trim() : null,
          email: email ? String(email).trim() : null,
          avatarUrl: avatarUrl ? String(avatarUrl).trim() : null,
          duties: duties ? String(duties).trim() : null,
          sortOrder: Number(sortOrder) || 0,
          isActive: isActive !== false,
        },
        include: {
          unit: true,
          department: true,
        },
      });

      return sendApiResponse(res, newStaff, 'Thêm mới Cán bộ vào Danh bạ thành công', 201);
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/v1/directory/staff/:id - Update Staff member
directoryRouter.put(
  '/staff/:id',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { unitId, departmentId, fullName, position, phone, extension, email, avatarUrl, duties, sortOrder, isActive } = req.body;

      const updatedStaff = await prisma.directoryStaff.update({
        where: { id },
        data: {
          unitId: unitId !== undefined ? (unitId ? String(unitId) : null) : undefined,
          departmentId: departmentId !== undefined ? (departmentId ? String(departmentId) : null) : undefined,
          fullName: fullName ? String(fullName).trim() : undefined,
          position: position ? String(position).trim() : undefined,
          phone: phone !== undefined ? (phone ? String(phone).trim() : null) : undefined,
          extension: extension !== undefined ? (extension ? String(extension).trim() : null) : undefined,
          email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
          avatarUrl: avatarUrl !== undefined ? (avatarUrl ? String(avatarUrl).trim() : null) : undefined,
          duties: duties !== undefined ? (duties ? String(duties).trim() : null) : undefined,
          sortOrder: sortOrder !== undefined ? Number(sortOrder) : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        },
        include: {
          unit: true,
          department: true,
        },
      });

      return sendApiResponse(res, updatedStaff, 'Cập nhật thông tin Cán bộ thành công');
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/directory/staff/:id/toggle-active - Toggle Active status
directoryRouter.patch(
  '/staff/:id/toggle-active',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN', 'EDITOR_LEAD']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentStaff = await prisma.directoryStaff.findUnique({ where: { id } });
      if (!currentStaff) {
        return res.status(404).json({ title: 'Not Found', detail: 'Không tìm thấy cán bộ' });
      }

      const updated = await prisma.directoryStaff.update({
        where: { id },
        data: { isActive: !currentStaff.isActive },
      });

      return sendApiResponse(res, updated, `Đã ${updated.isActive ? 'kích hoạt' : 'tạm ẩn'} cán bộ thành công`);
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/directory/staff/:id - Delete Staff member
directoryRouter.delete(
  '/staff/:id',
  JwtAuthGuard,
  RolesGuard(['SUPER_ADMIN', 'ADMIN']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.directoryStaff.delete({ where: { id } });
      return sendApiResponse(res, { id, deleted: true }, 'Xóa cán bộ khỏi Danh bạ thành công');
    } catch (error) {
      next(error);
    }
  }
);
