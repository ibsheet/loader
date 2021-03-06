export default {
  data: [
    {
      sa_nm: '홍길동',
      sa_id: '9821450',
      sa_dept: '04',
      sa_position: 'B0',
      sa_enterdate: '19980305',
      sa_desc: ''
    },
    {
      sa_nm: '김한국',
      sa_id: '9510427',
      sa_dept: '01',
      sa_position: 'A3',
      sa_enterdate: '19890317',
      sa_desc: ''
    }
  ],
  options: {
    // Cfg: {
    //   IgnoreFocused: true
    // },
    Def: {
      Col: {
        RelWidth: 1
      }
    },
    Cols: [
      {
        Header: '이름',
        Name: 'sa_nm',
        Type: 'Text',
        Width: 100
      },
      {
        Header: '사원번호',
        Name: 'sa_id',
        Type: 'Text',
        Align: 'center',
        Width: 100
      },
      {
        Header: '부서',
        Name: 'sa_dept',
        Type: 'Enum',
        Enum: '|경영지원|총무|인사|설계|시공1|시공2',
        EnumKeys: '|01|02|03|04|05|06',
        Width: 100
      },
      {
        Header: '직급',
        Name: 'sa_position',
        Type: 'Enum',
        Enum: '|대표|상무|이사|부장|차장|과장|대리|사원',
        EnumKeys: '|A1|A2|A3|B0|B1|C4|C5|C6',
        Width: 100
      },
      {
        Header: '입사일',
        Name: 'sa_enterdate',
        Type: 'Date',
        Width: 100,
        Format: 'yyyy/MM/dd'
      },
      {
        Header: '비고',
        Name: 'sa_desc',
        Type: 'Lines',
        Width: 100
      }
    ]
  }
}
